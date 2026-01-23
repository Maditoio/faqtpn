import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Public endpoint to get the credit rate for display on homepage
export async function GET() {
  try {
    const creditSetting = await prisma.systemSettings.findUnique({
      where: { key: 'owner_credit_rate' }
    })

    const creditRate = creditSetting ? parseFloat(creditSetting.value) : 10.0

    return NextResponse.json({
      success: true,
      creditRate
    })
  } catch (error) {
    console.error('Error fetching credit rate:', error)
    // Return default on error
    return NextResponse.json({
      success: true,
      creditRate: 10.0
    })
  }
}
