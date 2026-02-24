import { prisma } from '@/lib/prisma'

export async function getPropertyWithImages(propertyId: string) {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      images: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })
}
