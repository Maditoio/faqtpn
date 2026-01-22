'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/layout/Footer'
import { HomeIcon, SearchIcon, CheckIcon } from '@/components/icons/Icons'

interface Stats {
  total: number
  approved: number
  locations: number
}

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, locations: 0 })

  useEffect(() => {
    fetch('/api/properties/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data)
        // Update browser tab title with property count
        document.title = `faqtpn - ${data.approved} Properties Available`
      })
      .catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1920&h=1080&fit=crop"
            alt="Happy family in their new home"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        {/* Content Overlay - Centered */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-2xl">
              Find Your Perfect Home Today
            </h1>
            <p className="text-xl md:text-2xl text-white/95 mb-10 drop-shadow-lg max-w-2xl mx-auto">
              Discover thousands of rental properties in your area. 
              From cozy studios to spacious family homes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/properties">
                <Button variant="primary" size="md" className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-transparent shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto flex items-center justify-center">
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Browse Properties
                </Button>
              </Link>
              <Link href="/list-property">
                <Button variant="secondary" size="md" className="bg-white/20 backdrop-blur-md border-2 border-white text-white hover:bg-white hover:text-blue-600 shadow-xl w-full sm:w-auto flex items-center justify-center">
                  <HomeIcon className="w-5 h-5 mr-2" />
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <HomeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.approved.toLocaleString()}
              </div>
              <div className="text-gray-600">Active Properties</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">100%</div>
              <div className="text-gray-600">Verified Listings</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
                <SearchIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats.locations.toLocaleString()}
              </div>
              <div className="text-gray-600">Locations Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose faqtpn?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and listing rental properties simple, secure, and efficient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
                  alt="Wide selection"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                  <SearchIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                Wide Selection
              </h3>
              <p className="text-gray-600">
                Browse through hundreds of verified properties across multiple locations. 
                Find exactly what you're looking for.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop"
                  alt="Verified listings"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                Verified Listings
              </h3>
              <p className="text-gray-600">
                Every property is carefully reviewed and verified by our team 
                to ensure quality and authenticity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=400&h=300&fit=crop"
                  alt="Easy listing"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                  <HomeIcon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                Easy Listing
              </h3>
              <p className="text-gray-600">
                Property owners can list their rentals in minutes with our 
                simple and intuitive listing process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Create Account
                </h3>
                <p className="text-gray-600">
                  Sign up for free and set up your profile in minutes. Choose whether you're looking to rent or list properties.
                </p>
              </div>
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-16 left-full w-full h-1 bg-gradient-to-r from-blue-200 to-transparent" style={{ width: 'calc(100% - 2rem)' }}></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Search or List
                </h3>
                <p className="text-gray-600">
                  Browse available properties with advanced filters or create your own listing with photos and details.
                </p>
              </div>
              <div className="hidden md:block absolute top-16 left-full w-full h-1 bg-gradient-to-r from-blue-200 to-transparent" style={{ width: 'calc(100% - 2rem)' }}></div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Connect & Move
                </h3>
                <p className="text-gray-600">
                  Contact property owners directly, schedule viewings, and find your perfect home or tenant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Next Home?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of happy renters and property owners on faqtpn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100 w-full">
                Start Searching
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 w-full">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
