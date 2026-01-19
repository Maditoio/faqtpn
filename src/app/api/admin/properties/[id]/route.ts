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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
      where: { id: params.id },
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
      where: { id: params.id },
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
        targetId: params.id,
        details: reason || `Property ${action.toLowerCase()}d: ${property.title}`,
      },
    })

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
