import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import { uploadPropertyImageToBlob } from '@/lib/blob-storage'
import { invalidateCache } from '@/lib/cache'
import { toPropertyImageCompat } from '@/lib/property-images'

function parseBoolean(value: FormDataEntryValue | null): boolean | undefined {
  if (typeof value !== 'string') return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

function parseInteger(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== 'string') return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) return undefined
  return parsed
}

async function getOwnedProperty(propertyId: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      ownerId: true,
      maxImages: true,
    },
  })

  if (!property) {
    return { error: NextResponse.json({ error: 'Property not found' }, { status: 404 }) }
  }

  if (property.ownerId !== userId && role !== 'SUPER_ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { property }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    return NextResponse.json({
      images: property.images.map(toPropertyImageCompat),
    })
  } catch (error) {
    console.error('Error fetching property images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const ownership = await getOwnedProperty(id, user.id, user.role)

    if ('error' in ownership) {
      return ownership.error
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image exceeds 10MB limit' }, { status: 400 })
    }

    const requestedFeatured = parseBoolean(formData.get('isFeatured'))
    const requestedOrder = parseInteger(formData.get('order'))

    const currentImages = await prisma.propertyImage.findMany({
      where: { propertyId: id },
      select: { id: true, order: true },
      orderBy: { order: 'asc' },
    })

    if (currentImages.length >= ownership.property.maxImages) {
      return NextResponse.json(
        {
          error: `Photo limit exceeded. Maximum allowed: ${ownership.property.maxImages}`,
        },
        { status: 400 }
      )
    }

    const blob = await uploadPropertyImageToBlob({ propertyId: id, file })

    const nextOrder = requestedOrder ?? (currentImages.at(-1)?.order ?? -1) + 1
    const shouldBeFeatured = requestedFeatured ?? currentImages.length === 0

    const image = await prisma.$transaction(async (tx) => {
      if (shouldBeFeatured) {
        await tx.propertyImage.updateMany({
          where: { propertyId: id, isFeatured: true },
          data: { isFeatured: false },
        })
      }

      return tx.propertyImage.create({
        data: {
          propertyId: id,
          imageUrl: blob.url,
          isFeatured: shouldBeFeatured,
          order: nextOrder,
        },
      })
    })

    invalidateCache.property(id)
    invalidateCache.owner(ownership.property.ownerId)

    return NextResponse.json(
      {
        image: toPropertyImageCompat(image),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading property image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
