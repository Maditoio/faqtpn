import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { name, email, password, role } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 86400000) // 24 hours from now

    // Create verification token in database
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: verificationToken,
        expires,
      },
    })

    // Send verification email (non-blocking - don't fail registration if email fails)
    try {
      await sendVerificationEmail({
        to: email,
        userName: name,
        verificationToken,
      })
      console.log('✅ Verification email sent to:', email)
    } catch (emailError) {
      console.error('⚠️ Failed to send verification email:', emailError)
      // Continue with registration - user can request resend later
    }

    // Log user creation
    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        userId: user.id,
        details: `User registered: ${email}`,
      },
    })

    return NextResponse.json(
      { 
        message: 'User registered successfully! Please check your email to verify your account.', 
        user 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
