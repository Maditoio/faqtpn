import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { propertySchema, draftPropertySchema, propertySearchSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/authorization'
import cacheManager, { CacheKeys, CacheTTL, invalidateCache } from '@/lib/cache'
import { sendListingConfirmationEmail } from '@/lib/email'

// Configure API route
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds timeout

/**
 * GET /api/properties
 * Get all properties with optional search and filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const filters = {
      query: searchParams.get('query') || undefined,
      location: searchParams.get('location') || undefined,
      propertyType: searchParams.get('propertyType') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
      northEast: searchParams.get('northEast') || undefined,
      southWest: searchParams.get('southWest') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    }

    // Validate filters
    const validationResult = propertySearchSchema.safeParse(filters)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { query, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, northEast, southWest, page, limit } = validationResult.data

    // Build where clause
    const where: any = {
      status: 'APPROVED', // Only show approved properties to public
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (propertyType) {
      where.propertyType = propertyType
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (bedrooms !== undefined) {
      where.bedrooms = { gte: bedrooms }
    }

    if (bathrooms !== undefined) {
      where.bathrooms = { gte: bathrooms }
    }

    // Add geographic bounds filtering if provided
    if (northEast && southWest) {
      const [neLat, neLng] = northEast.split(',').map(Number)
      const [swLat, swLng] = southWest.split(',').map(Number)
      
      if (!isNaN(neLat) && !isNaN(neLng) && !isNaN(swLat) && !isNaN(swLng)) {
        where.latitude = { gte: swLat, lte: neLat }
        where.longitude = { gte: swLng, lte: neLng }
      }
    }

    // Calculate pagination
    const skip = ((page || 1) - 1) * (limit || 20)

    // Create cache key based on filters
    const cacheKey = CacheKeys.propertiesList({ 
      query, location, propertyType, minPrice, maxPrice, bedrooms, bathrooms, page, limit 
    })

    // Try to get from cache
    const result = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        // Get properties
        const [properties, total] = await Promise.all([
          prisma.property.findMany({
            where,
            include: {
              images: {
                orderBy: { order: 'asc' },
              },
              owner: {
                select: {
                  id: true,
                  name: true,
                },
              },
              _count: {
                select: {
                  favorites: true,
                },
              },
            },
            skip,
            take: limit || 20,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.property.count({ where }),
        ])

        return {
          properties,
          pagination: {
            page: page || 1,
            limit: limit || 20,
            total,
            totalPages: Math.ceil(total / (limit || 20)),
          },
        }
      },
      CacheTTL.SHORT // 5 minutes cache
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/properties
 * Create a new property (Home Owner only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'HOME_OWNER' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { images, paymentMethod, ...propertyData } = body

    console.log('📥 Received property data:', { 
      status: propertyData.status, 
      title: propertyData.title,
      hasImages: !!images,
      paymentMethod
    })

    // Determine if this is a draft or full submission
    const isDraft = propertyData.status === 'DRAFT'

    // Validate images only for non-drafts
    if (!isDraft) {
      if (!images || images.length === 0) {
        return NextResponse.json(
          { error: 'At least one image is required' },
          { status: 400 }
        )
      }

      if (images.length > 15) {
        return NextResponse.json(
          { error: 'Maximum 15 images allowed' },
          { status: 400 }
        )
      }
    }

    // Validate input using appropriate schema
    const validationResult = isDraft 
      ? draftPropertySchema.safeParse(propertyData)
      : propertySchema.safeParse(propertyData)
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.issues)
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    console.log('✅ Validation passed, creating property...')

    // Handle wallet payment if specified
    if (paymentMethod === 'wallet' && data.listingPrice && !isDraft) {
      console.log('💰 Processing wallet payment for listing...', { listingPrice: data.listingPrice })
      
      // Get user wallet
      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
      })

      if (!wallet || wallet.balance.toNumber() < data.listingPrice) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance' },
          { status: 400 }
        )
      }

      console.log('💳 Wallet balance sufficient:', wallet.balance.toNumber(), 'Required:', data.listingPrice)
    }

    // Prepare image data
    const imageCreate = images && images.length > 0
      ? {
          create: images.map((img: { data: string; isPrimary: boolean }, index: number) => ({
            url: img.data,
            isPrimary: img.isPrimary,
            order: index,
          })),
        }
      : undefined

    // Create property with images
    let property
    
    if (paymentMethod === 'wallet' && data.listingPrice && !isDraft) {
      // Create property and deduct from wallet in a transaction
      property = await prisma.$transaction(async (tx) => {
        // Create the property
        const newProperty = await tx.property.create({
          data: {
            ...data,
            ownerId: user.id,
            status: 'PENDING',
            paymentStatus: 'paid',
            paidAt: new Date(),
            ...(imageCreate && { images: imageCreate }),
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

        // Get wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId: user.id }
        })

        if (!wallet) {
          throw new Error('Wallet not found')
        }

        // Deduct from wallet
        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { decrement: data.listingPrice },
            totalSpent: { increment: data.listingPrice }
          }
        })

        // Create wallet transaction record
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            amount: data.listingPrice!,
            description: `Payment for listing: ${newProperty.title}`,
            referenceType: 'LISTING_PAYMENT',
            referenceId: newProperty.id,
            balanceBefore: updatedWallet.balance.toNumber() + data.listingPrice!,
            balanceAfter: updatedWallet.balance.toNumber()
          }
        })

        console.log('✅ Wallet payment processed:', {
          propertyId: newProperty.id,
          amount: data.listingPrice,
          newBalance: updatedWallet.balance.toNumber()
        })

        return newProperty
      })
    } else {
      // Regular property creation without wallet payment
      property = await prisma.property.create({
        data: {
          ...data,
          ownerId: user.id,
          status: data.status || (isDraft ? 'DRAFT' : 'PENDING'),
          ...(imageCreate && { images: imageCreate }),
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
    }

    console.log('✅ Property created successfully:', property.id)

    // Process wallet credits for property owner automatically
    // ONLY credit wallet if they paid with CARD, not if they paid with wallet
    if (property.paymentStatus === 'paid' && property.listingPrice && paymentMethod !== 'wallet') {
      try {
        console.log('💰 Crediting wallet for CARD payment:', property.id)
        // Get default credit rate from settings (default 10% back as credits)
        let creditRate = 10.0 // 10% default
        const creditSetting = await prisma.systemSettings.findUnique({
          where: { key: 'owner_credit_rate' }
        })
        if (creditSetting) {
          creditRate = parseFloat(creditSetting.value)
        }

        const creditAmount = property.listingPrice.toNumber() * (creditRate / 100)

        // Get or create owner wallet
        let wallet = await prisma.wallet.findUnique({
          where: { userId: property.ownerId }
        })

        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: { userId: property.ownerId }
          })
        }

        // Create transaction in a Prisma transaction
        await prisma.$transaction(async (tx) => {
          // Update wallet balance
          const updatedWallet = await tx.wallet.update({
            where: { id: wallet!.id },
            data: {
              balance: { increment: creditAmount },
              totalEarned: { increment: creditAmount }
            }
          })

          // Create transaction record
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

          // Update property with credit amount
          await tx.property.update({
            where: { id: property.id },
            data: {
              commissionAmount: creditAmount
            }
          })
        })

        console.log(`✅ Credits of R${creditAmount} added to owner ${property.ownerId} wallet`)
      } catch (creditError) {
        console.error('❌ Error processing credits:', creditError)
        // Don't fail the property creation if credits fail
      }
    }

    // Invalidate caches after creating property
    invalidateCache.property(property.id)
    invalidateCache.owner(user.id)

    // Send confirmation email for submitted properties (not drafts)
    if (!isDraft && property.owner?.email) {
      await sendListingConfirmationEmail({
        to: property.owner.email,
        ownerName: property.owner.name,
        propertyTitle: property.title,
        propertyId: property.id,
      })
    }

    return NextResponse.json(
      { message: 'Property created successfully', property },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ Error creating property:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3)
    })
    
    // Handle specific error types
    if (error.message?.includes('Request Entity Too Large')) {
      return NextResponse.json(
        { error: 'Images are too large. Please compress them and try again. Maximum total size is 4.5MB.' },
        { status: 413 }
      )
    }

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A property with this information already exists.' },
        { status: 409 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid user reference.' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
