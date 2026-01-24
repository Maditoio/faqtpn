'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { CheckIcon } from '@/components/icons/Icons'

export default function ListPropertyPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleGetStarted = () => {
    if (!session) {
      router.push('/auth/login?redirect=/owner/properties/new')
      return
    }
    // Go directly to property wizard
    router.push('/owner/properties/new')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
              List Your Property in Minutes
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Reach 2.5M+ renters monthly. Get your property rented fast with our simple 3-step process.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <div className="text-left">
                  <p className="font-bold text-xl">2.5M+</p>
                  <p className="text-blue-100 text-xs">Monthly Visitors</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                <div className="text-left">
                  <p className="font-bold text-xl">15K+</p>
                  <p className="text-blue-100 text-xs">Properties Listed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div className="text-left">
                  <p className="font-bold text-xl">48hrs</p>
                  <p className="text-blue-100 text-xs">Average Match Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
          Why List With Faqtpn?
        </h2>
        <p className="text-lg text-center text-gray-600 mb-10 max-w-3xl mx-auto">
          We make property rental simple, fast, and profitable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Targeted Reach</h3>
            <p className="text-gray-700 text-base leading-relaxed">
              Your property is shown to 2.5 million serious renters every month. No time-wasters, just qualified tenants.
            </p>
          </div>

          <div className="bg-white p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 flex items-center justify-center mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Affordable Pricing</h3>
            <p className="text-gray-700 text-base leading-relaxed">
              List your property starting from just R49 for 3 months. Choose from flexible plans with 3, 10, or 20 photos.
            </p>
          </div>

          <div className="bg-white p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Quick & Easy</h3>
            <p className="text-gray-700 text-base leading-relaxed">
              List your property in minutes. Our simple 3-step process gets your listing live fast.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Register</h3>
              <p className="text-blue-100 text-sm">
                Create your free account in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Add Details</h3>
              <p className="text-blue-100 text-sm">
                Fill in your property information and upload photos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Review & Pay</h3>
              <p className="text-blue-100 text-sm">
                Choose your listing plan and complete secure payment.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-3xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Go Live</h3>
              <p className="text-blue-100 text-sm">
                Your listing is reviewed and goes live within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-center text-gray-600 mb-8">
            Choose the plan that fits your needs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Plan */}
            <div className="bg-white shadow-lg border-2 border-gray-200 overflow-hidden pointer-events-none select-none">
              <div className="bg-gray-100 text-center py-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Basic</h3>
                <p className="text-gray-600 text-sm">Perfect for simple listings</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-4xl font-bold text-gray-900">R49</span>
                    <span className="text-lg text-gray-600 ml-2">/ 3 months</span>
                  </div>
                  <p className="text-gray-600 text-sm">Only R16.33 per month!</p>
                </div>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm"><strong>3 photos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">3 months visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">Direct tenant contact</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Standard Plan - Most Popular */}
            <div className="bg-white shadow-2xl border-4 border-blue-500 overflow-hidden transform scale-105 pointer-events-none select-none">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-4">
                <div className="inline-block bg-yellow-400 text-blue-900 px-2 py-1 text-xs font-bold mb-1">
                  MOST POPULAR
                </div>
                <h3 className="text-xl font-bold mb-1">Standard</h3>
                <p className="text-blue-100 text-sm">Best value for most properties</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-4xl font-bold text-gray-900">R64</span>
                    <span className="text-lg text-gray-600 ml-2">/ 3 months</span>
                  </div>
                  <p className="text-gray-600 text-sm">Only R21.33 per month!</p>
                </div>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm"><strong>10 photos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">3 months visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">Direct tenant contact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">Featured placement</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white shadow-lg border-2 border-purple-300 overflow-hidden pointer-events-none select-none">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-center py-4">
                <h3 className="text-xl font-bold mb-1">Premium</h3>
                <p className="text-purple-100 text-sm">Maximum exposure</p>
              </div>

              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-4xl font-bold text-gray-900">R74</span>
                    <span className="text-lg text-gray-600 ml-2">/ 3 months</span>
                  </div>
                  <p className="text-gray-600 text-sm">Only R24.67 per month!</p>
                </div>

                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm"><strong>20 photos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">3 months visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">Direct tenant contact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">Featured placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Common Features */}
          <div className="mt-10 bg-gray-50 p-6">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-4">All Plans Include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              <div className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">3 months of premium visibility</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Direct tenant contact via email, phone & WhatsApp</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Featured on search results</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Edit anytime during listing period</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">No commissions or hidden fees</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">Professional listing presentation</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-10 text-white text-center mt-12">
          <h2 className="text-3xl font-bold mb-3">Ready to Find Your Perfect Tenant?</h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of landlords who have successfully rented their properties through Faqtpn.
          </p>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGetStarted}
            className="!py-3 !px-8 !text-base font-bold !bg-white !text-blue-700 hover:!bg-blue-50 shadow-lg"
          >
            Start Listing Now
          </Button>

          <p className="text-blue-100 mt-4 text-sm">
            🔒 Secure payment • ✅ Instant activation
          </p>
        </div>
      </div>
    </div>
  )
}
