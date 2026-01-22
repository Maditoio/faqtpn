import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { invalidateCache } from '@/lib/cache'

const propertyAlertUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  location: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'TOWNHOUSE', 'COTTAGE', 'BACKROOM', 'WAREHOUSE', 'INDUSTRIAL_PROPERTY', 'COMMERCIAL_PROPERTY']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minBedrooms: z.number().min(0).optional(),
  minBathrooms: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
})

/**
 * PATCH /api/alerts/[id]
 * Update an alert
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if alert exists and belongs to user
    const alert = await prisma.propertyAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    if (alert.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = propertyAlertUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Update the alert
    const updatedAlert = await prisma.propertyAlert.update({
      where: { id },
      data,
    })

    // Invalidate user cache
    invalidateCache.user(session.user.id)

    return NextResponse.json({
      message: 'Alert updated successfully',
      alert: updatedAlert,
    })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/alerts/[id]
 * Delete an alert
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if alert exists and belongs to user
    const alert = await prisma.propertyAlert.findUnique({
      where: { id },
    })

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 })
    }

    if (alert.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the alert
    await prisma.propertyAlert.delete({
      where: { id },
    })

    // Invalidate user cache
    invalidateCache.user(session.user.id)

    return NextResponse.json({ message: 'Alert deleted successfully' })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
