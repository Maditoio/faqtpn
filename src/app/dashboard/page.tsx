'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { PropertyCard } from '@/components/properties/PropertyCard'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      // Redirect owners and admins to their dashboards
      if (session.user.role === 'HOME_OWNER') {
        router.push('/owner/dashboard')
      } else if (session.user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard')
      } else {
        fetchFavorites()
      }
    }
  }, [session, status, router])

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()
      setFavorites(data.favorites || [])
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/favorites/${propertyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchFavorites()
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">Your favorite properties</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold text-gray-900">
              {favorites.length}
            </div>
            <div className="text-gray-600 mt-1">Saved Properties</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Browse More
                </div>
                <div className="text-gray-600 mt-1">
                  Find your perfect rental
                </div>
              </div>
              <Link href="/properties">
                <Button variant="primary">Explore</Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Favorites */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Favorites
          </h2>

          {favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">
                No favorites yet
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Start browsing properties and save your favorites
              </p>
              <Link href="/properties">
                <Button variant="primary">Browse Properties</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((favorite) => (
                <PropertyCard
                  key={favorite.id}
                  property={favorite.property}
                  isFavorited={true}
                  onFavoriteToggle={() => handleRemoveFavorite(favorite.property.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
