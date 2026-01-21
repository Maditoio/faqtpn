import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import { adminActionSchema } from '@/lib/validations'

/**
 * PATCH /api/admin/properties/[id]
 * Admin action on a property (approve, suspend, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const body = await req.json()
    
    // Validate input
    const validationResult = adminActionSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { action, reason } = validationResult.data

    // Find property
    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Determine new status
    let newStatus: string
    let auditAction: string

    switch (action) {
      case 'APPROVE':
        newStatus = 'APPROVED'
        auditAction = 'PROPERTY_APPROVED'
        break
      case 'SUSPEND':
        newStatus = 'SUSPENDED'
        auditAction = 'PROPERTY_SUSPENDED'
        break
      case 'DELETE':
        newStatus = 'DELETED'
        auditAction = 'PROPERTY_DELETED'
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update property status
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { status: newStatus as any },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Log admin action
    await prisma.auditLog.create({
      data: {
        action: auditAction as any,
        userId: user.id,
        performedBy: user.id,
        targetId: id,
        details: reason || `Property ${action.toLowerCase()}d: ${property.title}`,
      },
    })

    // Create notification for property owner
    let notificationTitle = ''
    let notificationMessage = ''
    let notificationType: 'PROPERTY_APPROVED' | 'PROPERTY_REJECTED' = 'PROPERTY_APPROVED'

    if (action === 'APPROVE') {
      notificationTitle = '🎉 Property Approved!'
      notificationMessage = `Great news! Your property "${property.title}" has been approved and is now live on our platform.`
      notificationType = 'PROPERTY_APPROVED'
      
      // Also notify users who have favorited properties in the same location
      const usersWithFavoritesInLocation = await prisma.user.findMany({
        where: {
          favorites: {
            some: {
              property: {
                location: {
                  contains: property.location,
                  mode: 'insensitive'
                },
                status: 'APPROVED'
              }
            }
          }
        },
        select: {
          id: true
        }
      })

      // Create notifications for users interested in this location
      const locationNotifications = usersWithFavoritesInLocation
        .filter((u: any) => u.id !== property.ownerId) // Don't notify the owner
        .map((u: any) =>
          prisma.notification.create({
            data: {
              userId: u.id,
              title: '🏠 New Property in Your Area!',
              message: `A new property "${property.title}" is now available in ${property.location} for $${property.price}/month.`,
              type: 'NEW_PROPERTY_LOCATION',
              propertyId: id,
            },
          })
        )
      
      if (locationNotifications.length > 0) {
        await Promise.all(locationNotifications)
      }
    } else if (action === 'SUSPEND' || action === 'DELETE') {
      notificationTitle = 'Property Status Update'
      notificationMessage = `Your property "${property.title}" has been ${action === 'SUSPEND' ? 'suspended' : 'removed'}.${reason ? ` Reason: ${reason}` : ''}`
      notificationType = 'PROPERTY_REJECTED'
    }

    if (notificationTitle) {
      await prisma.notification.create({
        data: {
          userId: property.ownerId,
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          propertyId: id,
        },
      })
    }

    return NextResponse.json({
      message: `Property ${action.toLowerCase()}d successfully`,
      property: updatedProperty,
    })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
