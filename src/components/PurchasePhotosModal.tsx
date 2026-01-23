'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { EXTRA_PHOTO_PRICE } from '@/lib/photo-limits'

interface PurchasePhotosModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  currentPhotoCount: number
  planLimit: number
  walletBalance: number
  onPurchaseSuccess: (newLimit: number, newBalance: number) => void
}

export default function PurchasePhotosModal({
  isOpen,
  onClose,
  propertyId,
  currentPhotoCount,
  planLimit,
  walletBalance,
  onPurchaseSuccess,
}: PurchasePhotosModalProps) {
  const [numberOfPhotos, setNumberOfPhotos] = useState(1)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const cost = numberOfPhotos * EXTRA_PHOTO_PRICE
  const canAfford = walletBalance >= cost
  const newTotalLimit = planLimit + numberOfPhotos

  const handlePurchase = async () => {
    if (!canAfford) {
      setError(`Insufficient balance. You need R${cost} but have R${walletBalance}`)
      return
    }

    setPurchasing(true)
    setError('')

    try {
      const response = await fetch(`/api/properties/${propertyId}/purchase-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numberOfPhotos }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase photos')
      }

      // Notify parent of success
      onPurchaseSuccess(data.property.maxImages, data.walletBalance)
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Purchase Extra Photo Slots
          </h2>
          <p className="text-gray-600 text-sm">
            You've reached your plan limit of {planLimit} photos. Purchase additional slots to add more photos.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Current plan limit:</span>
            <span className="font-semibold text-gray-900">{planLimit} photos</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Photos uploaded:</span>
            <span className="font-semibold text-gray-900">{currentPhotoCount} photos</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Your wallet balance:</span>
            <span className="font-semibold text-green-600">R{walletBalance.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label htmlFor="numberOfPhotos" className="block text-sm font-medium text-gray-700 mb-2">
            Number of extra photos
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setNumberOfPhotos(Math.max(1, numberOfPhotos - 1))}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
            >
              −
            </button>
            <input
              id="numberOfPhotos"
              type="number"
              min="1"
              max="50"
              value={numberOfPhotos}
              onChange={(e) => setNumberOfPhotos(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center font-semibold text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setNumberOfPhotos(numberOfPhotos + 1)}
              className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-gray-700 transition-colors"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            R{EXTRA_PHOTO_PRICE} per extra photo
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Total cost:</span>
            <span className="text-2xl font-bold text-blue-600">R{cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">New total limit:</span>
            <span className="font-semibold text-gray-900">{newTotalLimit} photos</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!canAfford && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            ⚠️ Insufficient wallet balance. Please add funds to your wallet first.
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={purchasing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePurchase}
            disabled={purchasing || !canAfford}
            className="flex-1"
          >
            {purchasing ? 'Processing...' : `Purchase for R${cost}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
