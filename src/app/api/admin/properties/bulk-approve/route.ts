import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/authorization'

/**
 * POST /api/admin/properties/bulk-approve
 * Bulk approve multiple properties at once
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { propertyIds } = body

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid property IDs' },
        { status: 400 }
      )
    }

    // Fetch all properties to approve
    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        status: 'PENDING', // Only approve pending properties
      },
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

    if (properties.length === 0) {
      return NextResponse.json(
        { error: 'No pending properties found' },
        { status: 404 }
      )
    }

    // Update all properties to APPROVED
    await prisma.property.updateMany({
      where: {
        id: { in: properties.map((p: any) => p.id) },
      },
      data: {
        status: 'APPROVED',
      },
    })

    // Create audit logs for each approval
    await prisma.auditLog.createMany({
      data: properties.map((property: any) => ({
        action: 'PROPERTY_APPROVED',
        userId: user.id,
        performedBy: user.id,
        targetId: property.id,
        details: `Property bulk approved: ${property.title}`,
      })),
    })

    // Create notifications for property owners
    await prisma.notification.createMany({
      data: properties.map((property: any) => ({
        userId: property.ownerId,
        title: 'Property Approved',
        message: `Your property "${property.title}" has been approved and is now live!`,
        type: 'PROPERTY_APPROVED',
        propertyId: property.id,
      })),
    })

    return NextResponse.json({
      success: true,
      message: `Successfully approved ${properties.length} properties`,
      approvedCount: properties.length,
      approvedProperties: properties.map((p: any) => ({
        id: p.id,
        title: p.title,
      })),
    })
  } catch (error) {
    console.error('Error bulk approving properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
