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
              List your property starting from just R49 for 3 months. Choose from flexible plans with 3, 10, or 20 photos. No hidden fees, no commission.
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
                Choose your listing plan and complete secure payment. Simple one-time fee starting from R49.
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
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Choose the plan that fits your needs. No surprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
              <div className="bg-gray-100 text-center py-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <p className="text-gray-600">Perfect for simple listings</p>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">R49</span>
                    <span className="text-xl text-gray-600 ml-2">/ 3 months</span>
                  </div>
                  <p className="text-gray-600">Only R16.33 per month!</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700"><strong>3 photos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">3 months visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Direct tenant contact</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Standard Plan - Most Popular */}
            <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-500 overflow-hidden transform scale-105">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-6">
                <div className="inline-block bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  🎉 MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold mb-2">Standard</h3>
                <p className="text-blue-100">Best value for most properties</p>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">R64</span>
                    <span className="text-xl text-gray-600 ml-2">/ 3 months</span>
                  </div>
                  <p className="text-gray-600">Only R21.33 per month!</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700"><strong>10 photos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">3 months visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Direct tenant contact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Featured placement</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-center py-6">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <p className="text-purple-100">Maximum exposure</p>
              </div>

              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-gray-900">R74</span>
                    <span className="text-xl text-gray-600 ml-2">/ 3 months</span>
                  </div>
                  <p className="text-gray-600">Only R24.67 per month!</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700"><strong>20 photos</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">3 months visibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Direct tenant contact</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Featured placement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Common Features */}
          <div className="mt-12 bg-gray-50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">All Plans Include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">3 months of premium visibility</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Direct tenant contact via email, phone & WhatsApp</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Featured on search results</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Edit anytime during listing period</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">No commissions or hidden fees</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700">Professional listing presentation</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Perfect Tenant?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of landlords who have successfully rented their properties through Faqtpn.
          </p>

          <Button
            variant="primary"
            size="lg"
            onClick={handleGetStarted}
            className="!py-4 !px-8 !text-xl font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
          >
            Start Listing Now →
          </Button>

          <p className="text-blue-100 mt-6">
            🔒 Secure payment • ✅ Instant activation • 💯 Money-back guarantee
          </p>
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
