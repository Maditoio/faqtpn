import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { propertyUpdateSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/authorization'
import cacheManager, { CacheKeys, CacheTTL, invalidateCache } from '@/lib/cache'
import { toPropertyCompat } from '@/lib/property-images'

function isValidImageUrl(value: string): boolean {
  if (value.startsWith('data:')) {
    return false
  }

  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

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
        cacheManager.set(cacheKey, toPropertyCompat(property), CacheTTL.MEDIUM)
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

    return NextResponse.json({ property: toPropertyCompat(property) })
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

    console.log('📥 Received property update:', { 
      id,
      status: propertyData.status, 
      title: propertyData.title,
      hasImages: !!images 
    })

    // Validate input
    const validationResult = propertyUpdateSchema.safeParse(propertyData)
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues)
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

      // Calculate total images after update
      const totalImages = images.existing.length + images.new.length
      const maxAllowed = property.maxImages || 3

      // Validate photo limit
      if (totalImages > maxAllowed) {
        return NextResponse.json(
          { 
            error: `Photo limit exceeded. Your plan allows ${maxAllowed} photos, but you're trying to upload ${totalImages}. Please purchase additional photo slots or remove some photos.`,
            maxImages: maxAllowed,
            currentImages: totalImages
          },
          { status: 400 }
        )
      }

      // Delete all existing images
      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      })

      // Create new images from both existing (kept) and new uploads
      const allImages = [
        ...images.existing.map((img: { id: string; isFeatured?: boolean; isPrimary?: boolean }, index: number) => ({
          imageUrl: existingImages.find((existingImage) => existingImage.id === img.id)?.imageUrl || '',
          isFeatured: img.isFeatured ?? img.isPrimary ?? false,
          order: index,
        })),
        ...images.new.map((img: { imageUrl?: string; url?: string; data?: string; isFeatured?: boolean; isPrimary?: boolean }, index: number) => ({
          imageUrl: img.imageUrl || img.url || img.data || '',
          isFeatured: img.isFeatured ?? img.isPrimary ?? false,
          order: images.existing.length + index,
        })),
      ]

      if (allImages.some((img) => !img.imageUrl || !isValidImageUrl(img.imageUrl))) {
        return NextResponse.json(
          { error: 'Invalid image URL. Upload images to Blob before updating the property.' },
          { status: 400 }
        )
      }

      const featuredIndex = allImages.findIndex((img) => img.isFeatured)
      const enforcedFeaturedIndex = featuredIndex >= 0 ? featuredIndex : 0
      allImages.forEach((img, index) => {
        img.isFeatured = index === enforcedFeaturedIndex
      })

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

    // Process wallet credits if payment status changed to paid and not already credited
    const paymentStatusChanged = body.paymentStatus === 'paid'
    if (paymentStatusChanged && 
        !property.commissionAmount && 
        updatedProperty.listingPrice) {
      try {
        let creditRate = 10.0
        const creditSetting = await prisma.systemSettings.findUnique({
          where: { key: 'owner_credit_rate' }
        })
        if (creditSetting) {
          creditRate = parseFloat(creditSetting.value)
        }

        const creditAmount = updatedProperty.listingPrice.toNumber() * (creditRate / 100)

        let wallet = await prisma.wallet.findUnique({
          where: { userId: property.ownerId }
        })

        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: { userId: property.ownerId }
          })
        }

        await prisma.$transaction(async (tx) => {
          const updatedWallet = await tx.wallet.update({
            where: { id: wallet!.id },
            data: {
              balance: { increment: creditAmount },
              totalEarned: { increment: creditAmount }
            }
          })

          await tx.walletTransaction.create({
            data: {
              walletId: wallet!.id,
              type: 'CREDIT',
              amount: creditAmount,
              description: `Credits earned from listing: ${property.title}`,
              referenceType: 'LISTING',
              referenceId: property.id,
              balanceBefore: updatedWallet.balance.toNumber() - creditAmount,
              balanceAfter: updatedWallet.balance.toNumber()
            }
          })

          await tx.property.update({
            where: { id },
            data: { commissionAmount: creditAmount }
          })
        })

        console.log(`✅ Credits of R${creditAmount} added to owner ${property.ownerId} wallet`)
      } catch (creditError) {
        console.error('❌ Error processing credits:', creditError)
      }
    }

    // Invalidate caches
    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)

    console.log('✅ Property updated successfully:', id)

    return NextResponse.json({
      message: 'Property updated successfully',
      property: toPropertyCompat(updatedProperty),
    })
  } catch (error: any) {
    console.error('❌ Error updating property:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3)
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
