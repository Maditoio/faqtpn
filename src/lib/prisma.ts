import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * PrismaClient is attached to the `global` object in development to prevent
 * exhausting database connections due to hot reloading in Next.js development.
 */
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient
  pool: Pool
}

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new Pool({ connectionString: process.env.DATABASE_URL })
}

const adapter = new PrismaPg(globalForPrisma.pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
