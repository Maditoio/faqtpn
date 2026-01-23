import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

/**
 * GET /api/wallet
 * Get current user's wallet information
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create wallet for user
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        balance: true,
        totalEarned: true,
        totalSpent: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
        },
        select: {
          id: true,
          balance: true,
          totalEarned: true,
          totalSpent: true,
          createdAt: true,
          updatedAt: true,
        }
      })
    }

    return NextResponse.json({
      wallet: {
        ...wallet,
        balance: wallet.balance.toNumber(),
        totalEarned: wallet.totalEarned.toNumber(),
        totalSpent: wallet.totalSpent.toNumber(),
      }
    })

  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
