import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import prisma from '@/lib/prisma'
import { EXTRA_PHOTO_PRICE, calculateExtraPhotoCost } from '@/lib/photo-limits'

/**
 * POST /api/properties/[id]/purchase-photos
 * Purchase additional photo slots using wallet balance
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await req.json()
    const { numberOfPhotos } = body

    if (!numberOfPhotos || numberOfPhotos < 1) {
      return NextResponse.json(
        { error: 'Invalid number of photos' },
        { status: 400 }
      )
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        title: true,
        listingPlan: true,
        maxImages: true,
        images: {
          select: { id: true }
        }
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if user owns the property or is admin
    if (property.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Calculate cost
    const cost = calculateExtraPhotoCost(numberOfPhotos)

    // Get user wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet || wallet.balance.toNumber() < cost) {
      return NextResponse.json(
        { error: `Insufficient wallet balance. You need R${cost} but have R${wallet?.balance.toNumber() || 0}` },
        { status: 400 }
      )
    }

    // Process payment and update property in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: cost },
          totalSpent: { increment: cost }
        }
      })

      // Create wallet transaction record
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEBIT',
          amount: cost,
          description: `Purchase of ${numberOfPhotos} extra photo${numberOfPhotos > 1 ? 's' : ''} for listing: ${property.title}`,
          referenceType: 'PHOTO_PURCHASE',
          referenceId: property.id,
          balanceBefore: wallet.balance.toNumber(),
          balanceAfter: updatedWallet.balance.toNumber()
        }
      })

      // Update property max images
      const updatedProperty = await tx.property.update({
        where: { id },
        data: {
          maxImages: { increment: numberOfPhotos }
        },
        select: {
          id: true,
          maxImages: true
        }
      })

      return {
        property: updatedProperty,
        wallet: updatedWallet
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${numberOfPhotos} extra photo slot${numberOfPhotos > 1 ? 's' : ''}`,
      property: result.property,
      walletBalance: result.wallet.balance.toNumber(),
      cost
    })

  } catch (error) {
    console.error('Error purchasing photos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
