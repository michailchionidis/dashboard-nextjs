import { PrismaClient } from '@prisma/client'
import { getDatabaseUrl } from '@/app/lib/db'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  },
  log: ['query', 'error', 'warn']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma