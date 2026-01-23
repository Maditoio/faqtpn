'use client'

import React from 'react'
import { CheckIcon } from '@/components/icons/Icons'

export interface PricingPlan {
  id: string
  name: string
  price: number
  maxImages: number
  description: string
  features: string[]
  popular?: boolean
}

interface PricingSelectorProps {
  selectedPlan: string
  onSelectPlan: (planId: string) => void
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    maxImages: 3,
    description: 'Perfect for getting started',
    features: [
      '3 property images',
      '3 months listing',
      'Basic property details',
      'Search visibility',
      'Contact form',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 64,
    maxImages: 10,
    description: 'Great for showcasing your property',
    features: [
      'Up to 10 property images',
      '3 months listing',
      'All basic features',
      'Featured badge',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 74,
    maxImages: 20,
    description: 'Maximum exposure for your property',
    features: [
      'Up to 20 property images',
      '3 months listing',
      'All standard features',
      'Top placement',
      'Highlighted listing',
      'Premium badge',
    ],
  },
]

export default function PricingSelector({ selectedPlan, onSelectPlan }: PricingSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Listing Plan
        </h2>
        <p className="text-sm text-gray-600">
          All plans include 3 months of listing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-300 bg-white hover:border-blue-400 hover:shadow-md'
            }`}
            onClick={() => onSelectPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-0.5 text-xs font-bold">
                  POPULAR
                </span>
              </div>
            )}

            <div className="p-4">
              {/* Plan Header */}
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold text-gray-900">R{plan.price}</span>
                  <span className="text-sm text-gray-600">/3mo</span>
                </div>
                <div className="bg-blue-50 rounded px-2 py-1 inline-block">
                  <p className="text-xs font-semibold text-blue-900">
                    📸 {plan.maxImages} Images
                  </p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan.id)}
                className={`w-full py-2 px-4 font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-lg p-3 max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-blue-600">100%</p>
            <p className="text-xs text-gray-600">Secure</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">24/7</p>
            <p className="text-xs text-gray-600">Support</p>
          </div>
          <div>
            <p className="text-lg font-bold text-blue-600">3mo</p>
            <p className="text-xs text-gray-600">Listing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
