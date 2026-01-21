import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const propertyTypes = [
  'APARTMENT',
  'HOUSE',
  'TOWNHOUSE',
  'COTTAGE',
  'BACKROOM',
  'WAREHOUSE',
  'INDUSTRIAL_PROPERTY',
  'COMMERCIAL_PROPERTY',
]

async function main() {
  console.log('Updating properties with property types...')

  // Get all properties without a property type
  const properties = await prisma.property.findMany({
    select: { id: true, title: true },
  })

  console.log(`Found ${properties.length} properties to update`)

  // Update each property with a random property type
  // In a real scenario, you'd want to assign appropriate types based on property characteristics
  for (const property of properties) {
    const randomType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)]
    
    await prisma.property.update({
      where: { id: property.id },
      data: { propertyType: randomType },
    })
    
    console.log(`Updated "${property.title}" with type: ${randomType}`)
  }

  console.log('✓ All properties updated successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
