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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Rent Your Property
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of successful landlords and reach millions of potential tenants actively searching for their next home
            </p>
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-2xl">2.5M+</p>
                  <p className="text-blue-100 text-sm">Monthly Visitors</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-2xl">15K+</p>
                  <p className="text-blue-100 text-sm">Properties Listed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-2xl">48hrs</p>
                  <p className="text-blue-100 text-sm">Average Match Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          Why List With Faqtpn?
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          We make property rental simple, fast, and profitable. Here's what makes us different.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Targeted Reach</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Your property is shown to 2.5 million serious renters every month. No time-wasters, just qualified tenants actively searching for homes.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">💰</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Affordable Pricing</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              List your property for just R149 for 3 months. No hidden fees, no commission. One simple price for maximum exposure.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Quick & Easy</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              List your property in minutes. Our simple 3-step process gets your listing live fast. No complicated paperwork or waiting.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-white mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-4xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Register</h3>
              <p className="text-blue-100 text-lg">
                Create your free account in seconds. Already have one? Just log in.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-4xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Add Details</h3>
              <p className="text-blue-100 text-lg">
                Fill in your property information, upload photos, and set your price.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-4xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Review & Pay</h3>
              <p className="text-blue-100 text-lg">
                Review your listing and complete secure payment. Simple one-time fee of R149.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-4xl font-bold">4</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Go Live</h3>
              <p className="text-blue-100 text-lg">
                Your listing is reviewed and goes live within 24 hours. Start receiving inquiries!
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            One price, unlimited exposure. No surprises.
          </p>

          <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-500 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-6">
              <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-bold mb-2">
                🎉 BEST VALUE
              </div>
              <h3 className="text-3xl font-bold mb-2">Standard Listing</h3>
              <p className="text-blue-100">Perfect for landlords of all sizes</p>
            </div>

            <div className="p-12">
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-6xl font-bold text-gray-900">R149</span>
                  <span className="text-2xl text-gray-600 ml-2">/ 3 months</span>
                </div>
                <p className="text-gray-600 text-lg">That's only R49.67 per month!</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-lg">
                    <strong>3 months of premium visibility</strong> - Your property stays live for 90 days
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-lg">
                    <strong>Unlimited photo uploads</strong> - Showcase your property with as many images as you need
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-lg">
                    <strong>Featured on search results</strong> - Maximum visibility to millions of renters
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-lg">
                    <strong>Direct tenant contact</strong> - Receive inquiries via email, phone, and WhatsApp
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-lg">
                    <strong>Edit anytime</strong> - Update your listing whenever you need to
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-800 text-lg">
                    <strong>24/7 dashboard access</strong> - Monitor views and manage your listing
                  </span>
                </li>
              </ul>

              <Button
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                className="w-full !py-4 !text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg"
              >
                Get Started Now →
              </Button>

              <p className="text-center text-gray-600 mt-4 text-sm">
                🔒 Secure payment • ✅ Instant activation • 💯 Money-back guarantee
              </p>
            </div>
          </div>
        </div>

        {/* Social Proof - Hidden for now, can be activated later */}
        {/* <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Trusted by Property Owners Across South Africa
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-3xl font-bold text-blue-600">95%</p>
              <p className="text-gray-700">Success Rate</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-3xl font-bold text-blue-600">48hrs</p>
              <p className="text-gray-700">Avg. Response Time</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-3xl font-bold text-blue-600">15K+</p>
              <p className="text-gray-700">Active Listings</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-3xl font-bold text-blue-600">4.8/5</p>
              <p className="text-gray-700">Owner Rating</p>
            </div>
          </div>
        </div> */}
      </div>


    </div>
  )
}
