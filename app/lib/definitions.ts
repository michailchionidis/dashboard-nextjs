import { type Invoice, type Customer, type User, type Revenue } from '@prisma/client'

// Custom types που συνδυάζουν Prisma models
export type InvoiceWithCustomer = Invoice & {
  customer: Customer;
}

// Custom types για formatted data
export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
}

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
}