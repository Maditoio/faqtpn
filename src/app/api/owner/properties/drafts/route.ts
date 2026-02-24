import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import { toPropertyCompat } from '@/lib/property-images'

/**
 * GET /api/owner/properties/drafts
 * Get all draft properties for the current user
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

    const drafts = await prisma.property.findMany({
      where: {
        ownerId: user.id,
        status: 'DRAFT',
      },
      include: {
        images: {
          orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ drafts: drafts.map(toPropertyCompat) })
  } catch (error) {
    console.error('Error fetching drafts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
