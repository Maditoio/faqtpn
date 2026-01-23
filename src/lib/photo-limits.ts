/**
 * Photo Limits Helper
 * Handles photo limit calculations and validation for property listings
 */

import { pricingPlans } from '@/components/property/PricingSelector'

export const EXTRA_PHOTO_PRICE = 5 // R5 per extra photo

export interface PhotoLimitInfo {
  planLimit: number
  currentPhotoCount: number
  availableSlots: number
  canUploadMore: boolean
  needsPayment: boolean
}

/**
 * Get photo limit information for a property based on its plan
 */
export function getPhotoLimitInfo(
  listingPlan: string | null | undefined,
  currentPhotoCount: number
): PhotoLimitInfo {
  // Find the plan, default to basic if not found
  const plan = pricingPlans.find(p => p.id === (listingPlan || 'basic'))
  const planLimit = plan?.maxImages || 3

  const availableSlots = Math.max(0, planLimit - currentPhotoCount)
  const canUploadMore = availableSlots > 0
  const needsPayment = currentPhotoCount >= planLimit

  return {
    planLimit,
    currentPhotoCount,
    availableSlots,
    canUploadMore,
    needsPayment,
  }
}

/**
 * Calculate cost for additional photos beyond plan limit
 */
export function calculateExtraPhotoCost(numberOfExtraPhotos: number): number {
  return numberOfExtraPhotos * EXTRA_PHOTO_PRICE
}

/**
 * Validate if user can add photos (either within limit or has wallet balance)
 */
export function canAddPhotos(
  currentPhotoCount: number,
  planLimit: number,
  walletBalance: number,
  photosToAdd: number
): { allowed: boolean; cost: number; message?: string } {
  const totalPhotos = currentPhotoCount + photosToAdd
  
  if (totalPhotos <= planLimit) {
    return {
      allowed: true,
      cost: 0,
    }
  }

  const extraPhotos = totalPhotos - planLimit
  const cost = calculateExtraPhotoCost(extraPhotos)

  if (walletBalance >= cost) {
    return {
      allowed: true,
      cost,
    }
  }

  return {
    allowed: false,
    cost,
    message: `Insufficient wallet balance. You need R${cost} to add ${extraPhotos} extra photo${extraPhotos > 1 ? 's' : ''}. Your current balance is R${walletBalance}.`,
  }
}
