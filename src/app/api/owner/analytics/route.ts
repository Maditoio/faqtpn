import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import cacheManager, { CacheKeys, CacheTTL } from '@/lib/cache'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Use cache for analytics (heavy query)
    const cacheKey = CacheKeys.ownerAnalytics(userId)
    
    const result = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        // Get all owner's properties with related data
        const properties = await prisma.property.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        favorites: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            favorites: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate metrics for each property
    const propertyMetrics = properties.map(property => {
      const listedDate = property.createdAt
      const rentedDate = property.status === 'RENTED' ? property.updatedAt : null
      const firstInteractionDate = property.favorites.length > 0 
        ? property.favorites[0].createdAt 
        : null

      // Calculate days to rent (only if rented)
      const daysToRent = rentedDate 
        ? Math.floor((rentedDate.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24))
        : null

      // Calculate days to first interaction
      const daysToFirstInteraction = firstInteractionDate
        ? Math.floor((firstInteractionDate.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24))
        : null

      return {
        id: property.id,
        title: property.title,
        status: property.status,
        listedDate: listedDate.toISOString(),
        rentedDate: rentedDate?.toISOString() || null,
        firstInteractionDate: firstInteractionDate?.toISOString() || null,
        daysToRent,
        daysToFirstInteraction,
        totalFavorites: property._count.favorites,
        price: property.price ? Number(property.price) : null,
        bedrooms: property.bedrooms,
        propertyType: property.propertyType,
        location: property.city || property.location,
      }
    })

    // Calculate aggregate statistics
    const rentedProperties = propertyMetrics.filter(p => p.daysToRent !== null)
    const propertiesWithInteraction = propertyMetrics.filter(p => p.daysToFirstInteraction !== null)

    const avgDaysToRent = rentedProperties.length > 0
      ? rentedProperties.reduce((sum, p) => sum + (p.daysToRent || 0), 0) / rentedProperties.length
      : null

    const avgDaysToFirstInteraction = propertiesWithInteraction.length > 0
      ? propertiesWithInteraction.reduce((sum, p) => sum + (p.daysToFirstInteraction || 0), 0) / propertiesWithInteraction.length
      : null

    const totalFavorites = propertyMetrics.reduce((sum, p) => sum + p.totalFavorites, 0)
    
    const avgFavoritesPerProperty = properties.length > 0
      ? totalFavorites / properties.length
      : 0

    // Status breakdown
    const statusBreakdown = {
      DRAFT: properties.filter(p => p.status === 'DRAFT').length,
      PENDING: properties.filter(p => p.status === 'PENDING').length,
      APPROVED: properties.filter(p => p.status === 'APPROVED').length,
      RENTED: properties.filter(p => p.status === 'RENTED').length,
      SUSPENDED: properties.filter(p => p.status === 'SUSPENDED').length,
      DELETED: properties.filter(p => p.status === 'DELETED').length,
    }

    return {
      success: true,
      summary: {
        totalProperties: properties.length,
        totalRented: rentedProperties.length,
        avgDaysToRent: avgDaysToRent ? Math.round(avgDaysToRent * 10) / 10 : null,
        avgDaysToFirstInteraction: avgDaysToFirstInteraction ? Math.round(avgDaysToFirstInteraction * 10) / 10 : null,
        totalFavorites,
        avgFavoritesPerProperty: Math.round(avgFavoritesPerProperty * 10) / 10,
        statusBreakdown,
      },
      properties: propertyMetrics,
    }
      },
      CacheTTL.LONG // 30 minutes cache for analytics
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
