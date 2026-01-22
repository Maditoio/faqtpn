import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'
import { adminActionSchema } from '@/lib/validations'
import { invalidateCache } from '@/lib/cache'
import { notifyMatchingAlerts } from '@/lib/alert-matcher'
import { sendListingApprovalEmail, sendListingRejectionEmail } from '@/lib/email'

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
      const usersWithFavoritesInLocation = property.location
        ? await prisma.user.findMany({
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
        : []

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

      // Notify users with matching alerts
      await notifyMatchingAlerts({
        id: property.id,
        title: property.title,
        location: property.location,
        city: property.city,
        state: property.state,
        address: property.address,
        propertyType: property.propertyType,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
      })
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

    // Send email notifications to property owner
    const propertyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/properties/${id}`
    
    if (action === 'APPROVE' && updatedProperty.owner?.email) {
      await sendListingApprovalEmail({
        to: updatedProperty.owner.email,
        ownerName: updatedProperty.owner.name,
        propertyTitle: property.title,
        propertyUrl,
      })
    } else if ((action === 'SUSPEND' || action === 'DELETE') && updatedProperty.owner?.email) {
      await sendListingRejectionEmail({
        to: updatedProperty.owner.email,
        ownerName: updatedProperty.owner.name,
        propertyTitle: property.title,
        reason,
        propertyUrl,
      })
    }

    // Invalidate all relevant caches
    invalidateCache.property(id)
    invalidateCache.owner(property.ownerId)
    invalidateCache.adminStats()

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
