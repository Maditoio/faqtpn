import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      )
    }

    // Find agent profile by referral code
    const agentProfile = await prisma.agentProfile.findUnique({
      where: {
        referralCode: code,
        isActive: true
      },
      select: {
        userId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!agentProfile) {
      return NextResponse.json(
        { success: false, error: 'Invalid or inactive referral code' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      agentId: agentProfile.userId,
      agentName: agentProfile.user.name
    })
  } catch (error) {
    console.error('Error verifying referral code:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
