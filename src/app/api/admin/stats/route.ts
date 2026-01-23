import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import cacheManager, { CacheKeys, CacheTTL } from '@/lib/cache'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for time range
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'month' // week, month, year, all

    // Create cache key including range parameter
    const cacheKey = `${CacheKeys.adminStats()}:${range}`
    
    const stats = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        const now = new Date()
        let startDate: Date

        switch (range) {
          case 'week':
            startDate = new Date(now)
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate = new Date(now)
            startDate.setMonth(now.getMonth() - 1)
            break
          case 'year':
            startDate = new Date(now)
            startDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            startDate = new Date(0) // All time
        }

    // Parallel queries for better performance
    const [
      totalUsers,
      totalOwners,
      totalProperties,
      propertiesByStatus,
      newUsersInRange,
      newPropertiesInRange,
      topOwners,
      topLocations,
      totalFavorites,
      propertiesByMonth,
      usersByRole,
      rentedProperties,
      averagePropertyPrice,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total owners
      prisma.user.count({ where: { role: 'HOME_OWNER' } }),

      // Total properties
      prisma.property.count(),

      // Properties by status
      prisma.property.groupBy({
        by: ['status'],
        _count: true,
      }),

      // New users in selected range
      prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),

      // New properties in selected range
      prisma.property.count({
        where: { createdAt: { gte: startDate } },
      }),

      // Top owners by property count
      prisma.property.groupBy({
        by: ['ownerId'],
        _count: true,
        orderBy: { _count: { ownerId: 'desc' } },
        take: 10,
      }),

      // Top locations
      prisma.property.groupBy({
        by: ['location'],
        where: { status: 'APPROVED' },
        _count: true,
        orderBy: { _count: { location: 'desc' } },
        take: 10,
      }),

      // Total favorites
      prisma.favorite.count(),

      // Properties created by month (last 12 months)
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*)::int as count
        FROM properties
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `,

      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: true,
      }),

      // Rented properties
      prisma.property.count({
        where: { status: 'RENTED' },
      }),

      // Average property price
      prisma.property.aggregate({
        where: { status: 'APPROVED' },
        _avg: { price: true },
      }),
    ])

    // Get owner details for top owners
    const ownerIds = topOwners.map(o => o.ownerId)
    const ownerDetails = await prisma.user.findMany({
      where: { id: { in: ownerIds } },
      select: { id: true, name: true, email: true },
    })

    const topOwnersWithDetails = topOwners.map(owner => ({
      ...owner,
      owner: ownerDetails.find(o => o.id === owner.ownerId),
    }))

    // Calculate rates
    const statusBreakdown = propertiesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>)

    const approvalRate = totalProperties > 0 
      ? Math.round(((statusBreakdown.APPROVED || 0) / totalProperties) * 100)
      : 0

    const rejectionRate = totalProperties > 0
      ? Math.round(((statusBreakdown.SUSPENDED || 0) / totalProperties) * 100)
      : 0

    const occupancyRate = totalProperties > 0
      ? Math.round((rentedProperties / totalProperties) * 100)
      : 0

    // Calculate growth rates
    const previousStartDate = new Date(startDate)
    if (range === 'week') {
      previousStartDate.setDate(startDate.getDate() - 7)
    } else if (range === 'month') {
      previousStartDate.setMonth(startDate.getMonth() - 1)
    } else if (range === 'year') {
      previousStartDate.setFullYear(startDate.getFullYear() - 1)
    }

    const [previousUsers, previousProperties] = await Promise.all([
      prisma.user.count({
        where: { 
          createdAt: { 
            gte: previousStartDate,
            lt: startDate 
          } 
        },
      }),
      prisma.property.count({
        where: { 
          createdAt: { 
            gte: previousStartDate,
            lt: startDate 
          } 
        },
      }),
    ])

    const userGrowth = previousUsers > 0
      ? Math.round(((newUsersInRange - previousUsers) / previousUsers) * 100)
      : 0

    const propertyGrowth = previousProperties > 0
      ? Math.round(((newPropertiesInRange - previousProperties) / previousProperties) * 100)
      : 0

    return {
      overview: {
        totalUsers,
        totalOwners,
        totalProperties,
        totalRegularUsers: totalUsers - totalOwners,
        totalFavorites,
        averagePrice: Math.round(Number(averagePropertyPrice._avg.price) || 0),
      },
      statusBreakdown,
      rates: {
        approvalRate,
        rejectionRate,
        occupancyRate,
      },
      growth: {
        newUsers: newUsersInRange,
        newProperties: newPropertiesInRange,
        userGrowth,
        propertyGrowth,
        range,
      },
      topOwners: topOwnersWithDetails,
      topLocations,
      propertiesByMonth,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count
        return acc
      }, {} as Record<string, number>),
      }
      },
      CacheTTL.LONG // 30 minutes cache for admin stats
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
