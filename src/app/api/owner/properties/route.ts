import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import cacheManager, { CacheKeys, CacheTTL } from '@/lib/cache'
import { toPropertyCompat } from '@/lib/property-images'

/**
 * GET /api/owner/properties
 * Get properties owned by current user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'HOME_OWNER' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cacheKey = CacheKeys.ownerProperties(user.id)
    
    const properties = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        return await prisma.property.findMany({
          where: { ownerId: user.id },
          include: {
            images: {
              orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
              take: 1,
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      },
      CacheTTL.SHORT // 5 minutes
    )

    return NextResponse.json({ properties: properties.map(toPropertyCompat) })
  } catch (error) {
    console.error('Error fetching owner properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
