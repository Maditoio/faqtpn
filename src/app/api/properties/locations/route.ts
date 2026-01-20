import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/properties/locations
 * Get popular locations with property counts
 */
export async function GET() {
  try {
    // Get all approved properties grouped by location
    const locations = await prisma.property.groupBy({
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
      take: 10, // Top 10 popular locations
    })

    // Format the response
    const formattedLocations = locations.map((loc) => ({
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
