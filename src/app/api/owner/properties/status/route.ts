import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { PropertyStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const isAdmin = session.user.role === 'SUPER_ADMIN'

    // Get query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const statusFilter = searchParams.get('status') || 'ALL'

    // Build where clause
    const where = {
      ...(isAdmin ? {} : { ownerId: userId }),
      ...(statusFilter !== 'ALL' ? { status: statusFilter as PropertyStatus } : {}),
    }

    // Get total count
    const total = await prisma.property.count({ where })

    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        location: true,
        price: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get status breakdown (always for all properties)
    const statusCounts = await prisma.property.groupBy({
      by: ['status'],
      where: isAdmin ? {} : { ownerId: userId },
      _count: true,
    })

    const breakdown = statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    // Get time-based statistics
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const baseWhere = isAdmin ? {} : { ownerId: userId }

    const [thisWeek, thisMonth, thisYear, approvalStats] = await Promise.all([
      // Properties created this week
      prisma.property.count({
        where: { ...baseWhere, createdAt: { gte: startOfWeek } },
      }),
      // Properties created this month
      prisma.property.count({
        where: { ...baseWhere, createdAt: { gte: startOfMonth } },
      }),
      // Properties created this year
      prisma.property.count({
        where: { ...baseWhere, createdAt: { gte: startOfYear } },
      }),
      // Approval/rejection stats
      prisma.property.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: true,
        _min: { updatedAt: true },
        _max: { updatedAt: true },
      }),
    ])

    const stats = {
      thisWeek,
      thisMonth,
      thisYear,
      approvalRate: breakdown.APPROVED && total > 0 
        ? Math.round((breakdown.APPROVED / total) * 100) 
        : 0,
      rejectionRate: breakdown.SUSPENDED && total > 0
        ? Math.round((breakdown.SUSPENDED / total) * 100)
        : 0,
      pendingRate: breakdown.PENDING && total > 0
        ? Math.round((breakdown.PENDING / total) * 100)
        : 0,
    }

    return NextResponse.json({
      properties: properties.map(p => ({
        ...p,
        favoritesCount: p._count.favorites,
      })),
      breakdown,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching properties status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
