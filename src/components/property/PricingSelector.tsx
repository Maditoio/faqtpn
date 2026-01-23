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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Choose Your Listing Plan
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the plan that best showcases your property. All plans include 3 months of listing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 transition-all cursor-pointer ${
              selectedPlan === plan.id
                ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
            }`}
            onClick={() => onSelectPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">R{plan.price}</span>
                  <span className="text-gray-600">/3 months</span>
                </div>
              </div>

              {/* Image Badge */}
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg p-3 mb-6 text-center">
                <p className="text-sm font-semibold text-blue-900">
                  📸 Up to {plan.maxImages} Images
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600 mb-1">100%</p>
            <p className="text-sm text-gray-600">Secure Payment</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 mb-1">24/7</p>
            <p className="text-sm text-gray-600">Support Available</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600 mb-1">3 Months</p>
            <p className="text-sm text-gray-600">Guaranteed Listing</p>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
        <p className="text-sm text-blue-900">
          <strong>💡 Value tip:</strong> Premium listings with more images get 5x more inquiries! 
          The Standard plan offers the best value - only R15 extra for 7 additional images.
        </p>
      </div>
    </div>
  )
}
