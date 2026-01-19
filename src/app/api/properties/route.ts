import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { propertySchema, propertySearchSchema } from '@/lib/validations'
import { getCurrentUser } from '@/lib/authorization'

/**
 * GET /api/properties
 * Get all properties with optional search and filters
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const filters = {
      query: searchParams.get('query') || undefined,
      location: searchParams.get('location') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
      bathrooms: searchParams.get('bathrooms') ? Number(searchParams.get('bathrooms')) : undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    }

    // Validate filters
    const validationResult = propertySearchSchema.safeParse(filters)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { query, location, minPrice, maxPrice, bedrooms, bathrooms, page, limit } = validationResult.data

    // Build where clause
    const where: any = {
      status: 'APPROVED', // Only show approved properties to public
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    if (bedrooms !== undefined) {
      where.bedrooms = { gte: bedrooms }
    }

    if (bathrooms !== undefined) {
      where.bathrooms = { gte: bathrooms }
    }

    // Calculate pagination
    const skip = ((page || 1) - 1) * (limit || 20)

    // Get properties
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              favorites: true,
            },
          },
        },
        skip,
        take: limit || 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.property.count({ where }),
    ])

    return NextResponse.json({
      properties,
      pagination: {
        page: page || 1,
        limit: limit || 20,
        total,
        totalPages: Math.ceil(total / (limit || 20)),
      },
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/properties
 * Create a new property (Home Owner only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'HOME_OWNER' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = propertySchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Create property
    const property = await prisma.property.create({
      data: {
        ...data,
        ownerId: user.id,
        status: 'PENDING', // Requires admin approval
      },
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

    return NextResponse.json(
      { message: 'Property created successfully', property },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
