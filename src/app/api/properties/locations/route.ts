import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cacheManager, { CacheKeys, CacheTTL } from '@/lib/cache'

/**
 * GET /api/properties/locations
 * Get popular locations with property counts
 */
export async function GET() {
  try {
    const locations = await cacheManager.getOrSet(
      CacheKeys.propertyLocations(),
      async () => {
        return prisma.property.groupBy({
          by: ['location'],
          where: {
            status: 'APPROVED',
          },
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: 'desc',
            },
          },
          take: 10,
        })
      },
      CacheTTL.VERY_LONG
    )

    const formattedLocations = locations
      .filter((loc) => !!loc.location)
      .map((loc) => ({
        location: loc.location,
        count: loc._count.id,
      }))

    return NextResponse.json({
      locations: formattedLocations,
    })
  } catch (error) {
    console.error('Error fetching locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
