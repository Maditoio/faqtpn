import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { propertyUpdateSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/authorization'

/**
 * GET /api/properties/[id]
 * Get a single property by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if user is authorized to view pending properties
    const user = await getCurrentUser()
    
    if (property.status !== 'APPROVED') {
      if (!user || (user.id !== property.ownerId && user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json({ property })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/properties/[id]
 * Update a property (Owner or Admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Check authorization
    if (user.id !== property.ownerId && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = propertyUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: validationResult.data,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Property updated successfully',
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

/**
 * DELETE /api/properties/[id]
 * Delete a property (Owner or Admin only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Check authorization
    if (user.id !== property.ownerId && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by setting status to DELETED
    await prisma.property.update({
      where: { id: params.id },
      data: { status: 'DELETED' },
    })

    // Log action if admin
    if (user.role === 'SUPER_ADMIN') {
      await prisma.auditLog.create({
        data: {
          action: 'PROPERTY_DELETED',
          userId: user.id,
          targetId: params.id,
          details: `Property deleted: ${property.title}`,
        },
      })
    }

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
