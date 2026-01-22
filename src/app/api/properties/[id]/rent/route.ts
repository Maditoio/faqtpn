import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { invalidateCache } from '@/lib/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find property
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: true,
        favorites: {
          include: {
            user: true
          }
        }
      }
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Only the owner or admin can mark as rented
    if (property.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update property status to RENTED
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { status: 'RENTED' }
    })

    // Create notifications for all users who favorited this property
    const notificationPromises = property.favorites.map((favorite: any) =>
      prisma.notification.create({
        data: {
          userId: favorite.userId,
          title: 'Property No Longer Available',
          message: `The property "${property.title}" at ${property.location} has been rented and is no longer available.`,
          type: 'PROPERTY_UNAVAILABLE',
          propertyId: property.id
        }
      })
    )

    await Promise.all(notificationPromises)

    // Invalidate caches
    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)
    // Invalidate all users who had it favorited
    property.favorites.forEach((fav: any) => {
      invalidateCache.user(fav.userId)
    })

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      notificationsSent: property.favorites.length
    })
  } catch (error) {
    console.error('Error marking property as rented:', error)
    return NextResponse.json(
      { error: 'Failed to mark property as rented' },
      { status: 500 }
    )
  }
}
