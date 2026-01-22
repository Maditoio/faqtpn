import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { invalidateCache } from '@/lib/cache'

// Validation schema for property alerts
const propertyAlertSchema = z.object({
  name: z.string().min(1, 'Alert name is required').max(100),
  location: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'TOWNHOUSE', 'COTTAGE', 'BACKROOM', 'WAREHOUSE', 'INDUSTRIAL_PROPERTY', 'COMMERCIAL_PROPERTY']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minBedrooms: z.number().min(0).optional(),
  minBathrooms: z.number().min(0).optional(),
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
})

/**
 * GET /api/alerts
 * Get all alerts for the current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const alerts = await prisma.propertyAlert.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/alerts
 * Create a new alert
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Auto-enable consent when user creates first alert (implicit consent through action)
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        alertsConsent: true,
        alertsConsentDate: new Date(),
      },
    })

    const body = await request.json()

    // Validate input
    const validationResult = propertyAlertSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if user already has an alert with the same name
    const existingAlert = await prisma.propertyAlert.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
      },
    })

    if (existingAlert) {
      return NextResponse.json(
        { error: 'You already have an alert with this name' },
        { status: 409 }
      )
    }

    // Create the alert
    const alert = await prisma.propertyAlert.create({
      data: {
        userId: session.user.id,
        name: data.name,
        location: data.location,
        propertyType: data.propertyType,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        minBedrooms: data.minBedrooms,
        minBathrooms: data.minBathrooms,
        notifyEmail: data.notifyEmail ?? true,
        notifyInApp: data.notifyInApp ?? true,
      },
    })

    // Invalidate user cache
    invalidateCache.user(session.user.id)

    return NextResponse.json(
      { message: 'Alert created successfully', alert },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
