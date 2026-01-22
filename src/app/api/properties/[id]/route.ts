import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { propertyUpdateSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/authorization'
import cacheManager, { CacheKeys, CacheTTL, invalidateCache } from '@/lib/cache'

/**
 * GET /api/properties/[id]
 * Get a single property by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Try to get from cache first
    const cacheKey = CacheKeys.propertyDetail(id)
    const cachedProperty = cacheManager.get<any>(cacheKey)
    
    let property
    
    if (cachedProperty) {
      property = cachedProperty
    } else {
      property = await prisma.property.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              whatsapp: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      })
      
      // Cache only if property exists and is approved (public)
      if (property && property.status === 'APPROVED') {
        cacheManager.set(cacheKey, property, CacheTTL.MEDIUM)
      }
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized to view pending properties
    const user = await getCurrentUser()
    
    if (property.status !== 'APPROVED') {
      if (!user || (user.id !== property.ownerId && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/properties/[id]
 * Update a property (Owner or Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find property with favorites to notify users
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        favorites: {
          include: {
            user: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (user.id !== property.ownerId && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { images, ...propertyData } = body

    // Validate input
    const validationResult = propertyUpdateSchema.safeParse(propertyData)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Track changes for notifications
    const oldPrice = property.price
    const oldStatus = property.status
    const newPrice = validationResult.data.price
    const newStatus = validationResult.data.status

    // Handle image updates if provided
    let imageUpdate = {}
    if (images) {
      // Get existing images from database
      const existingImages = await prisma.propertyImage.findMany({
        where: { propertyId: id },
      })

      // Delete all existing images
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      })

      // Create new images from both existing (kept) and new uploads
      const allImages = [
        ...images.existing.map((img: any, index: number) => ({
          url: existingImages.find((ei: any) => ei.id === img.id)?.url || '',
          isPrimary: img.isPrimary,
          order: index,
        })),
        ...images.new.map((img: any, index: number) => ({
          url: img.data,
          isPrimary: img.isPrimary,
          order: images.existing.length + index,
        })),
      ]

      if (allImages.length > 0) {
        imageUpdate = {
          images: {
            create: allImages,
          },
        }
      }
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...validationResult.data,
        ...imageUpdate,
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Send notifications based on changes
    const notifications = []

    // Price drop notification (>10% decrease)
    if (newPrice && oldPrice && newPrice < Number(oldPrice)) {
      const percentageDecrease = ((Number(oldPrice) - Number(newPrice)) / Number(oldPrice)) * 100
      if (percentageDecrease >= 10 && property.favorites.length > 0) {
        const priceDropNotifications = property.favorites.map((favorite: any) =>
          prisma.notification.create({
            data: {
              userId: favorite.userId,
              title: '💰 Price Drop Alert!',
              message: `Great news! The price for "${property.title}" has dropped from $${oldPrice} to $${newPrice} (${percentageDecrease.toFixed(0)}% off).`,
              type: 'PRICE_DROP',
              propertyId: property.id
            }
          })
        )
        notifications.push(...priceDropNotifications)
      }
    }

    // Property back available notification (RENTED -> APPROVED)
    if (oldStatus === 'RENTED' && newStatus === 'APPROVED' && property.favorites.length > 0) {
      const availableNotifications = property.favorites.map((favorite: any) =>
        prisma.notification.create({
          data: {
            userId: favorite.userId,
            title: '🏠 Property Available Again!',
            message: `Good news! "${property.title}" at ${property.location} is available for rent again.`,
            type: 'PROPERTY_AVAILABLE',
            propertyId: property.id
          }
        })
      )
      notifications.push(...availableNotifications)
    }

    // Send all notifications
    if (notifications.length > 0) {
      await Promise.all(notifications)
    }

    // Invalidate caches
    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)

    return NextResponse.json({
      message: 'Property updated successfully',
      property: updatedProperty,
    })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/properties/[id]
 * Delete a property (Owner or Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find property
    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (user.id !== property.ownerId && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by setting status to DELETED
    await prisma.property.update({
      where: { id },
      data: { status: 'DELETED' },
    })

    // Invalidate caches
    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)

    // Log action if admin
    if (user.role === 'SUPER_ADMIN') {
      await prisma.auditLog.create({
        data: {
          action: 'PROPERTY_DELETED',
          userId: user.id,
          targetId: id,
          details: `Property deleted: ${property.title}`,
        },
      })
    }

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
