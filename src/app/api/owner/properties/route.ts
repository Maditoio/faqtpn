import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'

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

    const properties = await prisma.property.findMany({
      where: { ownerId: user.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ properties })
  } catch (error) {
    console.error('Error fetching owner properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
