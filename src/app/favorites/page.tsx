'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { HeartIcon } from '@/components/icons/Icons'

interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  status: string
  images?: Array<{ url: string; altText?: string | null }>
  _count?: { favorites: number }
}

interface Favorite {
  id: string
  property: Property
  createdAt: string
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/favorites')
      return
    }

    if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status, router])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/favorites')
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      setFavorites(data.favorites)
    } catch (err) {
      setError('Failed to load favorites')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (propertyId: string) => {
    try {
      // Find the favorite to delete
      const favorite = favorites.find(fav => fav.property.id === propertyId)
      
      if (favorite) {
        const response = await fetch(`/api/favorites/${favorite.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove from local state
          setFavorites(favorites.filter(fav => fav.property.id !== propertyId))
        }
      }
    } catch (err) {
      console.error('Error removing favorite:', err)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-red-600" filled />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            {favorites.length === 0
              ? 'You haven\'t saved any properties yet'
              : `${favorites.length} ${favorites.length === 1 ? 'property' : 'properties'} saved`}
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save your favorites to see them here
            </p>
            <button
              onClick={() => router.push('/properties')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <PropertyCard
                key={favorite.id}
                property={favorite.property}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
