import { prisma } from '@/prisma/prisma'
import { formatCurrency } from './utils';
import { Prisma, Status } from '@prisma/client'


/**
 * Ανακτά τα δεδομένα εσόδων ταξινομημένα κατά μήνα
 * Χρησιμοποιείται για το revenue chart στο dashboard
 * Επιστρέφει: Array με μηνιαία έσοδα
 */
export async function fetchRevenue() {
  try {
    const revenue = await prisma.revenue.findMany({
      orderBy: { month: 'asc' }
    });
    
    if (!revenue.length) {
      throw new Error('No revenue data found');
    }
    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

/**
 * Ανακτά τα τελευταία 5 πληρωμένα invoices
 * Χρησιμοποιείται για το latest invoices στο dashboard
 * Επιστρέφει: Array με τα τελευταία 5 πληρωμένα invoices
 */
export async function fetchLatestInvoices() {
  try {
    const invoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true
          }
        }
      }
    });

    return invoices.map((invoice) => ({
      id: invoice.id,
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.image_url,
      amount: formatCurrency(invoice.amount)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

type InvoiceStatusResult = {
  paid: number | null;
  pending: number | null;
}


/**
 * Ανακτά συγκεντρωτικά στοιχεία για το dashboard:
 * - Συνολικό αριθμό τιμολογίων
 * - Συνολικό αριθμό πελατών
 * - Σύνολο πληρωμένων τιμολογίων
 * - Σύνολο εκκρεμών τιμολογίων
 * Χρησιμοποιείται στα cards του dashboard
 * Επιστρέφει: Object με τα συγκεντρωτικά στοιχεία
 */
export async function fetchCardData() {
  try {
    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.$queryRaw<InvoiceStatusResult[]>`
        SELECT
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
        FROM "Invoice"
      `
    ]);

    // Παίρνουμε το πρώτο αποτέλεσμα από το array
    const [status] = invoiceStatus;

    return {
      numberOfInvoices: invoiceCount,
      numberOfCustomers: customerCount,
      totalPaidInvoices: formatCurrency(status?.paid ?? 0),
      totalPendingInvoices: formatCurrency(status?.pending ?? 0)
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        customer: {
          select: {
            name: true,
            email: true,
            image_url: true,
          },
        },
      },
      where: {
        OR: [
          { customer: { name: { contains: query, mode: 'insensitive' } } },
          { customer: { email: { contains: query, mode: 'insensitive' } } },
          { amount: { equals: isNaN(Number(query)) ? undefined : Number(query) } },
          { date: { equals: isNaN(Date.parse(query)) ? undefined : new Date(query) } },
          { status: query.toLowerCase() === 'pending' ? Status.pending : 
            query.toLowerCase() === 'paid' ? Status.paid : undefined },
        ],
      },
      orderBy: {
        date: 'desc',
      },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    // Μετατροπή της δομής για να ταιριάζει με το UI
    return invoices.map(invoice => ({
      ...invoice,
      ...invoice.customer,
      // Αφαιρούμε το nested customer object
      customer: undefined,
    }));

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

/**
 * Ελέγχει αν ένα string είναι έγκυρο Status (pending ή paid)
 * Χρησιμοποιείται ως type guard για το TypeScript
 */
function isValidStatus(value: string): value is Status {
  return value === 'pending' || value === 'paid';
}

/**
 * Ανακτά τον αριθμό των σελίδων των invoices με βάση το query
 * Χρησιμοποιείται για την προσθήκη pagination στην invoices page
 * Επιστρέφει: Αριθμός σελίδων
 */
export async function fetchInvoicesPages(query: string) {
  try {
    // Δημιουργούμε το array με τα conditions
    const whereConditions: Prisma.InvoiceWhereInput[] = [
      { customer: { name: { contains: query, mode: 'insensitive' } } },
      { customer: { email: { contains: query, mode: 'insensitive' } } }
    ];

    // Προσθέτουμε το amount αν είναι αριθμός
    if (!isNaN(Number(query))) {
      whereConditions.push({ amount: { equals: Number(query) } });
    }

    // Προσθέτουμε το status αν είναι valid
    if (isValidStatus(query)) {
      whereConditions.push({ status: query });
    }

    const count = await prisma.invoice.count({
      where: {
        OR: whereConditions
      }
    });
    
    return Math.ceil(count / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

/**
 * Ανακτά τα στοιχεία ενός invoice με βάση το id
 * Χρησιμοποιείται για την προσθήκη pagination στην invoices page
 * Επιστρέφει: Object με τα στοιχεία του invoice
 */
export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        customer_id: true,
        amount: true,
        status: true
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    return {
      ...invoice,
      amount: invoice.amount / 100 // Convert amount from cents to dollars
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

/**
 * Ανακτά όλους τους πελάτες ταξινομημένους με βάση το όνομα
 * Χρησιμοποιείται για την προσθήκη pagination στην customers page
 * Επιστρέφει: Array με όλους τους πελάτες
 */
export async function fetchCustomers() {
  try {
    return await prisma.customer.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all customers.');
  }
}

// Ορίζουμε τον τύπο για το αποτέλεσμα του SQL query
type CustomerWithAggregates = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
}

/**
 * Ανακτά τα στοιχεία των πελατών με βάση το query
 * Χρησιμοποιείται για την προσθήκη pagination στην customers page
 * Επιστρέφει: Array με τα στοιχεία των πελατών
 */
export async function fetchFilteredCustomers(query: string) {
  try {
    const customers = await prisma.$queryRaw<CustomerWithAggregates[]>`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = ${Status.pending} THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = ${Status.paid} THEN invoices.amount ELSE 0 END) AS total_paid
      FROM "Customer" customers
      LEFT JOIN "Invoice" invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `;

    return customers.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending ?? 0),
      total_paid: formatCurrency(customer.total_paid ?? 0)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}