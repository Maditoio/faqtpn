import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import { deletePropertyImageFromBlob } from '@/lib/blob-storage'
import { invalidateCache } from '@/lib/cache'
import { toPropertyImageCompat } from '@/lib/property-images'

interface RouteParams {
  id: string
  imageId: string
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, imageId } = await params
    const payload = (await req.json()) as { isFeatured?: boolean; order?: number }

    if (payload.order !== undefined && (!Number.isInteger(payload.order) || payload.order < 0)) {
      return NextResponse.json({ error: 'order must be a non-negative integer' }, { status: 400 })
    }

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.ownerId !== user.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const existingImage = await prisma.propertyImage.findFirst({
      where: { id: imageId, propertyId: id },
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const image = await prisma.$transaction(async (tx) => {
      if (payload.isFeatured === true) {
        await tx.propertyImage.updateMany({
          where: { propertyId: id, isFeatured: true },
          data: { isFeatured: false },
        })
      }

      return tx.propertyImage.update({
        where: { id: imageId },
        data: {
          ...(payload.isFeatured !== undefined && { isFeatured: payload.isFeatured }),
          ...(payload.order !== undefined && { order: payload.order }),
        },
      })
    })

    if (payload.isFeatured === false) {
      const featuredCount = await prisma.propertyImage.count({
        where: { propertyId: id, isFeatured: true },
      })

      if (featuredCount === 0) {
        const firstImage = await prisma.propertyImage.findFirst({
          where: { propertyId: id },
          orderBy: { order: 'asc' },
        })

        if (firstImage) {
          await prisma.propertyImage.update({
            where: { id: firstImage.id },
            data: { isFeatured: true },
          })
        }
      }
    }

    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)

    return NextResponse.json({ image: toPropertyImageCompat(image) })
  } catch (error) {
    console.error('Error updating property image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, imageId } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.ownerId !== user.id && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const image = await prisma.propertyImage.findFirst({
      where: { id: imageId, propertyId: id },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    await deletePropertyImageFromBlob(image.imageUrl)

    await prisma.$transaction(async (tx) => {
      await tx.propertyImage.delete({ where: { id: image.id } })

      if (image.isFeatured) {
        const replacement = await tx.propertyImage.findFirst({
          where: { propertyId: id },
          orderBy: { order: 'asc' },
        })

        if (replacement) {
          await tx.propertyImage.update({
            where: { id: replacement.id },
            data: { isFeatured: true },
          })
        }
      }
    })

    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting property image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
