import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache the result for 60 seconds to avoid excessive database reads
export const revalidate = 60

export async function GET() {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: 'enable_map_view' }
    })

    // Default to true if setting doesn't exist
    const mapEnabled = setting?.value === 'true'

    return NextResponse.json(
      {
        success: true,
        mapEnabled
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching map feature setting:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', mapEnabled: true },
      { status: 500 }
    )
  }
}
