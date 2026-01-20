import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/properties/stats
 * Get statistics about properties
 */
export async function GET() {
  try {
    const [totalProperties, approvedProperties, locations] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'APPROVED' } }),
      prisma.property.groupBy({
        by: ['location'],
        where: { status: 'APPROVED' },
      }),
    ])

    return NextResponse.json({
      total: totalProperties,
      approved: approvedProperties,
      locations: locations.length,
    })
  } catch (error) {
    console.error('Error fetching property stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
