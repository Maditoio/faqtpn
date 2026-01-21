import { prisma } from './src/lib/prisma.ts'

async function main() {
  const statusCounts = await prisma.property.groupBy({
    by: ['status'],
    _count: true,
  })
  
  console.log('\n📊 Property Status Breakdown:')
  console.log('─'.repeat(40))
  
  statusCounts.forEach(({ status, _count }) => {
    console.log(`${status.padEnd(15)}: ${_count}`)
  })
  
  console.log('─'.repeat(40))
  
  const total = await prisma.property.count()
  const approved = await prisma.property.count({ where: { status: 'APPROVED' } })
  
  console.log(`\nTotal Properties: ${total}`)
  console.log(`Approved (visible on homepage): ${approved}`)
  console.log(`\n💡 Only APPROVED properties appear on the public home page.\n`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
