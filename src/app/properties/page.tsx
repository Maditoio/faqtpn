'use client'

import React, { useState, useEffect } from 'react'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SearchIcon, FilterIcon } from '@/components/icons/Icons'
import { useSession } from 'next-auth/react'

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

export default function PropertiesPage() {
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('query', searchQuery)
      if (filters.location) params.append('location', filters.location)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms)
      if (filters.bathrooms) params.append('bathrooms', filters.bathrooms)

      const response = await fetch(`/api/properties?${params}`)
      const data = await response.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchProperties()
  }

  const handleFavoriteToggle = async (propertyId: string) => {
    if (!session) {
      alert('Please sign in to favorite properties')
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      if (response.ok) {
        // Refresh properties to update favorite count
        fetchProperties()
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Browse Properties
          </h1>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleSearch}
                className="whitespace-nowrap"
              >
                <SearchIcon className="w-5 h-5 mr-2" />
                Search
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <FilterIcon className="w-5 h-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Bedrooms"
                  value={filters.bedrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bedrooms: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Bathrooms"
                  value={filters.bathrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bathrooms: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No properties found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search criteria
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {properties.length} properties
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
