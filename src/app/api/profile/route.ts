import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { userProfileSchema } from '@/lib/validations/profile'
import cacheManager, { CacheKeys, CacheTTL, invalidateCache } from '@/lib/cache'

// GET current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = CacheKeys.userProfile(session.user.id)
    
    const user = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        return await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true,
            role: true,
            alertsConsent: true,
            alertsConsentDate: true,
            createdAt: true,
          }
        })
      },
      CacheTTL.MEDIUM // 10 minutes
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PATCH update user profile
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Handle alerts consent separately (doesn't require full validation)
    if ('alertsConsent' in body) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          alertsConsent: body.alertsConsent,
          alertsConsentDate: body.alertsConsent ? new Date() : null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          whatsapp: true,
          role: true,
          alertsConsent: true,
          alertsConsentDate: true,
          createdAt: true,
        }
      })

      // Invalidate user cache
      invalidateCache.user(session.user.id)

      return NextResponse.json({ user: updatedUser })
    }

    // Validate input for regular profile updates
    const validationResult = userProfileSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { name, phone, whatsapp } = validationResult.data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone: phone || null,
        whatsapp: whatsapp || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        role: true,
        alertsConsent: true,
        alertsConsentDate: true,
        createdAt: true,
      }
    })

    // Invalidate user cache
    invalidateCache.user(session.user.id)

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
