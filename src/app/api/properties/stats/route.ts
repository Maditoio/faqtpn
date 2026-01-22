import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cacheManager, { CacheKeys, CacheTTL } from '@/lib/cache'

/**
 * GET /api/properties/stats
 * Get statistics about properties
 */
export async function GET() {
  try {
    const cacheKey = CacheKeys.propertyStats()
    
    const stats = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        const [totalProperties, approvedProperties, locations] = await Promise.all([
          prisma.property.count(),
          prisma.property.count({ where: { status: 'APPROVED' } }),
          prisma.property.groupBy({
            by: ['location'],
            where: { status: 'APPROVED' },
          }),
        ])

        return {
          total: totalProperties,
          approved: approvedProperties,
          locations: locations.length,
        }
      },
      CacheTTL.LONG // 30 minutes
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching property stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
