'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { LocationIcon, HeartIcon, SquareIcon } from '@/components/icons/Icons'

interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  address: string | null
  bedrooms: number
  bathrooms: number
  squareFeet: number | null
  status: string
  images?: Array<{ url: string; altText?: string | null }>
  owner: {
    id: string
    name: string
  }
  _count?: { favorites: number }
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    const loadProperty = async () => {
      const resolvedParams = await params
      fetchProperty(resolvedParams.id)
    }
    loadProperty()
  }, [params])

  const fetchProperty = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data.property)
      } else {
        console.error('Property not found')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async () => {
    if (!session) {
      alert('Please sign in to favorite properties')
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property?.id }),
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        if (property) {
          const resolvedParams = await params
          fetchProperty(resolvedParams.id)
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => router.push('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    )
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : [{ url: '/placeholder-property.jpg', altText: 'Property image' }]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/properties')}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Properties
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image Gallery */}
          <div className="relative">
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].altText || property.title}
              className="w-full h-96 object-cover"
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-3 h-3 rounded-full ${
                      selectedImage === index ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <LocationIcon className="w-5 h-5 mr-2" />
                  <span>{property.location}</span>
                </div>
                {property.address && (
                  <p className="text-sm text-gray-500">{property.address}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${property.price.toLocaleString()}<span className="text-lg text-gray-500">/mo</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleFavoriteToggle}
                  className="flex items-center gap-2"
                >
                  <HeartIcon className="w-5 h-5" filled={isFavorited} />
                  {property._count?.favorites || 0} favorites
                </Button>
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <SquareIcon className="w-4 h-4" />
                  Bedrooms
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.bedrooms}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <SquareIcon className="w-4 h-4" />
                  Bathrooms
                </div>
                <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
              </div>
              {property.squareFeet && (
                <div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <SquareIcon className="w-4 h-4" />
                    Square Feet
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {property.squareFeet.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Owner Info */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Listed by</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {property.owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{property.owner.name}</div>
                  <div className="text-sm text-gray-500">Property Owner</div>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            {session ? (
              <div className="mt-8">
                <Button variant="primary" className="w-full" size="lg">
                  Contact Owner
                </Button>
              </div>
            ) : (
              <div className="mt-8">
                <Button
                  variant="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign in to Contact Owner
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
