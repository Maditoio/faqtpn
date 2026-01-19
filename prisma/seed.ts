import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Super Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@renthub.com' },
    update: {},
    create: {
      email: 'admin@renthub.com',
      name: 'Super Admin',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  })
  console.log('✓ Created Super Admin:', admin.email)

  // Create Home Owner
  const ownerPassword = await bcrypt.hash('Owner@123', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'John Owner',
      passwordHash: ownerPassword,
      role: 'HOME_OWNER',
      isActive: true,
      emailVerified: true,
    },
  })
  console.log('✓ Created Home Owner:', owner.email)

  // Create Regular User
  const userPassword = await bcrypt.hash('User@123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Jane Renter',
      passwordHash: userPassword,
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  })
  console.log('✓ Created Regular User:', user.email)

  // Create Sample Properties
  const property1 = await prisma.property.create({
    data: {
      title: 'Spacious 2BR Apartment in Downtown',
      description:
        'Beautiful 2-bedroom apartment in the heart of downtown. Features include modern kitchen, hardwood floors, and stunning city views. Walking distance to shops, restaurants, and public transit.',
      price: 2500,
      location: 'San Francisco, CA',
      address: '123 Market St, San Francisco, CA 94103',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      status: 'APPROVED',
      ownerId: owner.id,
    },
  })
  console.log('✓ Created Property:', property1.title)

  const property2 = await prisma.property.create({
    data: {
      title: 'Cozy Studio Near University',
      description:
        'Perfect for students or young professionals. This cozy studio features an open layout, modern appliances, and is just minutes from the university campus.',
      price: 1500,
      location: 'Berkeley, CA',
      address: '456 College Ave, Berkeley, CA 94704',
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 500,
      status: 'APPROVED',
      ownerId: owner.id,
    },
  })
  console.log('✓ Created Property:', property2.title)

  const property3 = await prisma.property.create({
    data: {
      title: 'Luxury 3BR Condo with Bay Views',
      description:
        'Stunning luxury condo with panoramic bay views. Features include gourmet kitchen, spa-like bathrooms, in-unit laundry, and access to building amenities including gym and pool.',
      price: 4500,
      location: 'Oakland, CA',
      address: '789 Lakeshore Dr, Oakland, CA 94612',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      status: 'PENDING',
      ownerId: owner.id,
    },
  })
  console.log('✓ Created Property:', property3.title)

  // Add favorites
  await prisma.favorite.create({
    data: {
      userId: user.id,
      propertyId: property1.id,
    },
  })
  console.log('✓ Added favorite for user')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Super Admin:')
  console.log('  Email: admin@renthub.com')
  console.log('  Password: Admin@123')
  console.log('\nHome Owner:')
  console.log('  Email: owner@example.com')
  console.log('  Password: Owner@123')
  console.log('\nRegular User:')
  console.log('  Email: user@example.com')
  console.log('  Password: User@123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
