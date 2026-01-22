import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

/**
 * POST /api/auth/request-reset
 * Request password reset email
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If that email exists, a reset link has been sent.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    })

    // Create new reset token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: resetToken,
        expires,
      },
    })

    // Send password reset email
    await sendPasswordResetEmail({
      to: email,
      userName: user.name,
      resetToken,
    })

    // Log request
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_REQUESTED',
        userId: user.id,
        details: `Password reset requested for: ${email}`,
      },
    })

    return NextResponse.json(
      { message: 'If that email exists, a reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
