import { PrismaClient, Status } from '@prisma/client'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { users, customers, invoices, revenue } from '../app/lib/placeholder-data'
import { getDatabaseUrl } from '../app/lib/db'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

async function main() {
  try {
    // Seed Users
    console.log('Seeding users...')
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10)
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          name: user.name,
          email: user.email,
          password: hashedPassword
        }
      })
    }

    // Seed Customers
    console.log('Seeding customers...')
    for (const customer of customers) {
      await prisma.customer.upsert({
        where: { id: customer.id },
        update: {},
        create: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image_url: customer.image_url
        }
      })
    }

    // Seed Invoices
    console.log('Seeding invoices...')
    for (const invoice of invoices) {
      await prisma.invoice.upsert({
        where: { id: invoice.id },
        update: {},
        create: {
          id: invoice.id,
          customer_id: invoice.customer_id,
          amount: invoice.amount,
          status: invoice.status as Status,
          date: new Date(invoice.date)
        }
      })
    }

    // Seed Revenue
    console.log('Seeding revenue...')
    for (const rev of revenue) {
      const revenueId = crypto.randomUUID()
      
      // Μετατροπή του month string σε έγκυρη ημερομηνία
      const monthDate = new Date(rev.month)
      
      // Έλεγχος αν η ημερομηνία είναι έγκυρη
      if (isNaN(monthDate.getTime())) {
        console.error(`Invalid date for revenue: ${rev.month}`)
        continue // Προχωράμε στο επόμενο record
      }

      await prisma.revenue.upsert({
        where: { id: revenueId },
        update: {},
        create: {
          id: revenueId,
          month: monthDate,
          revenue: rev.revenue
        }
      })
    }

    console.log('Seeding completed!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()