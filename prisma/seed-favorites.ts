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
  console.log('🌱 Seeding database...')

  // Clear existing data (optional - remove if you want to keep existing data)
  console.log('Clearing existing favorites and notifications...')
  await prisma.notification.deleteMany({})
  await prisma.favorite.deleteMany({})

  // Get existing users
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['user@example.com', 'admin@renthub.com']
      }
    }
  })

  const regularUser = users.find(u => u.email === 'user@example.com')
  const admin = users.find(u => u.email === 'admin@renthub.com')

  if (!regularUser || !admin) {
    console.log('❌ Required test users not found. Please ensure user@example.com and admin@renthub.com exist.')
    return
  }

  // Get approved properties
  const properties = await prisma.property.findMany({
    where: {
      status: 'APPROVED'
    },
    take: 3
  })

  if (properties.length === 0) {
    console.log('❌ No approved properties found. Please create some properties first.')
    return
  }

  console.log(`Found ${properties.length} approved properties`)

  // Create favorites for the regular user
  console.log('Creating favorites for user@example.com...')
  for (const property of properties) {
    await prisma.favorite.create({
      data: {
        userId: regularUser.id,
        propertyId: property.id
      }
    })
    console.log(`✓ Added favorite: ${property.title}`)
  }

  // Create some sample notifications
  console.log('Creating sample notifications...')
  await prisma.notification.create({
    data: {
      userId: regularUser.id,
      title: 'Welcome to RentHub!',
      message: 'Thank you for joining RentHub. Start exploring properties and add them to your favorites.',
      type: 'INFO'
    }
  })

  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'New Property Pending Approval',
      message: 'A new property listing is waiting for your review.',
      type: 'INFO'
    }
  })

  console.log('✓ Created sample notifications')

  console.log('✅ Seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`- Added ${properties.length} favorites for user@example.com`)
  console.log('- Created 2 sample notifications')
  console.log('')
  console.log('🧪 Test scenario:')
  console.log('1. Login as owner (owner@example.com / Owner@123)')
  console.log('2. Go to "My Properties" and click "Mark as Rented" on any property')
  console.log('3. Logout and login as user (user@example.com / User@123)')
  console.log('4. Check the notification bell - you should see a notification about the property being unavailable')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
