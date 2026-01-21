import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Adding contact information to owners...')

  // Update owner account with contact info
  const owner = await prisma.user.update({
    where: {
      email: 'owner@example.com'
    },
    data: {
      phone: '+1 (555) 123-4567',
      whatsapp: '+15551234567'  // WhatsApp format without spaces or special chars
    }
  })

  console.log(`✓ Updated ${owner.name} with contact info:`)
  console.log(`  - Phone: ${owner.phone}`)
  console.log(`  - WhatsApp: ${owner.whatsapp}`)

  console.log('\n✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
