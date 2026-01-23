import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'

/**
 * POST /api/admin/credit-wallets
 * Retroactively credit wallets for properties that were paid but not credited
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get default credit rate
    let creditRate = 10.0
    const creditSetting = await prisma.systemSettings.findUnique({
      where: { key: 'owner_credit_rate' }
    })
    if (creditSetting) {
      creditRate = parseFloat(creditSetting.value)
    }

    // Find properties that were paid but don't have commission amount set
    const propertiesToCredit = await prisma.property.findMany({
      where: {
        paymentStatus: 'paid',
        listingPrice: { not: null },
        commissionAmount: null
      }
    })

    let credited = 0
    let errors = 0

    for (const property of propertiesToCredit) {
      try {
        const creditAmount = property.listingPrice!.toNumber() * (creditRate / 100)

        // Get or create owner wallet
        let wallet = await prisma.wallet.findUnique({
          where: { userId: property.ownerId }
        })

        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: { userId: property.ownerId }
          })
        }

        // Credit wallet in transaction
        await prisma.$transaction(async (tx) => {
          const updatedWallet = await tx.wallet.update({
            where: { id: wallet!.id },
            data: {
              balance: { increment: creditAmount },
              totalEarned: { increment: creditAmount }
            }
          })

          await tx.walletTransaction.create({
            data: {
              walletId: wallet!.id,
              type: 'CREDIT',
              amount: creditAmount,
              description: `Credits earned from listing: ${property.title}`,
              referenceType: 'LISTING',
              referenceId: property.id,
              balanceBefore: updatedWallet.balance.toNumber() - creditAmount,
              balanceAfter: updatedWallet.balance.toNumber()
            }
          })

          await tx.property.update({
            where: { id: property.id },
            data: { commissionAmount: creditAmount }
          })
        })

        credited++
        console.log(`✅ Credited R${creditAmount} for property ${property.id}`)
      } catch (error) {
        errors++
        console.error(`❌ Error crediting property ${property.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${propertiesToCredit.length} properties`,
      credited,
      errors
    })
  } catch (error) {
    console.error('Error processing wallet credits:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
