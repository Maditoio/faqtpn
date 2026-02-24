import { prisma } from '@/lib/prisma'

type ImageLike = {
  imageUrl: string
  isFeatured: boolean
}

export type PropertyImageCompat<T extends ImageLike = ImageLike> = T & {
  url: string
  isPrimary: boolean
}

export function toPropertyImageCompat<T extends ImageLike>(image: T): PropertyImageCompat<T> {
  return {
    ...image,
    url: image.imageUrl,
    isPrimary: image.isFeatured,
  }
}

export function toPropertyCompat<T extends { images: ImageLike[] }>(property: T): Omit<T, 'images'> & { images: PropertyImageCompat[] } {
  return {
    ...property,
    images: property.images.map(toPropertyImageCompat),
  }
}

export async function getPropertyWithOrderedImages(propertyId: string) {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      images: {
        orderBy: { order: 'asc' },
      },
    },
  })
}
