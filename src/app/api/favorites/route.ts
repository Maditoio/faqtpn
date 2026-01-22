import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import cacheManager, { CacheKeys, CacheTTL, invalidateCache } from '@/lib/cache'

/**
 * GET /api/favorites
 * Get current user's favorite properties
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = CacheKeys.userFavorites(user.id)
    
    const favorites = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        return await prisma.favorite.findMany({
          where: { userId: user.id },
          include: {
            property: {
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
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      },
      CacheTTL.SHORT // 5 minutes
    )

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * Add a property to favorites
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: user.id,
          propertyId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Property already in favorites' },
        { status: 409 }
      )
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        propertyId,
      },
      include: {
        property: {
          include: {
            images: true,
          },
        },
      },
    })

    // Invalidate caches
    invalidateCache.user(user.id)
    cacheManager.del(CacheKeys.propertyFavorites(propertyId))

    return NextResponse.json(
      { message: 'Property added to favorites', favorite },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
