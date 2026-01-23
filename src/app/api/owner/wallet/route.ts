import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get or create wallet for user
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0,
          totalEarned: 0,
          totalSpent: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      wallet: {
        balance: wallet.balance.toNumber(),
        totalEarned: wallet.totalEarned.toNumber(),
        totalSpent: wallet.totalSpent.toNumber()
      }
    })
  } catch (error) {
    console.error('Error fetching wallet:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
