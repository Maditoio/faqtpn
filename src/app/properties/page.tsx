'use client'

import React, { useState, useEffect } from 'react'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SearchIcon, FilterIcon, MapPinIcon } from '@/components/icons/Icons'
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
  const [popularLocations, setPopularLocations] = useState<Array<{ location: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
  })
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    fetchProperties()
    fetchPopularLocations()
  }, [])

  const fetchPopularLocations = async () => {
    try {
      const response = await fetch('/api/properties/locations')
      const data = await response.json()
      setPopularLocations(data.locations || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

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

  const handleLocationClick = (location: string) => {
    setFilters({ ...filters, location })
    setSearchQuery('')
    setTimeout(() => fetchProperties(), 0)
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
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSearch}
              className="whitespace-nowrap flex items-center justify-center"
            >
              <SearchIcon className="w-5 h-5 mr-2" />
              Search
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden whitespace-nowrap flex items-center justify-center"
            >
              <FilterIcon className="w-5 h-5 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Properties Grid + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Properties Grid - Left Side */}
          <div className="flex-1">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Filters Sidebar - Right Side */}
          {showFilters && (
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FilterIcon className="w-5 h-5 mr-2" />
                    Filters
                  </h2>
                  <button
                    onClick={() => {
                      setFilters({
                        location: '',
                        minPrice: '',
                        maxPrice: '',
                        bedrooms: '',
                        bathrooms: '',
                      })
                      setSearchQuery('')
                      setTimeout(() => fetchProperties(), 0)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter location"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({ ...filters, location: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, minPrice: e.target.value })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters({ ...filters, maxPrice: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <Input
                      type="number"
                      placeholder="Min bedrooms"
                      value={filters.bedrooms}
                      onChange={(e) =>
                        setFilters({ ...filters, bedrooms: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms
                    </label>
                    <Input
                      type="number"
                      placeholder="Min bathrooms"
                      value={filters.bathrooms}
                      onChange={(e) =>
                        setFilters({ ...filters, bathrooms: e.target.value })
                      }
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSearch}
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                </div>

                {/* Popular Locations */}
                {popularLocations.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      Popular Locations
                    </h3>
                    <div className="space-y-2">
                      {popularLocations.map((loc) => (
                        <button
                          key={loc.location}
                          onClick={() => handleLocationClick(loc.location)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center justify-between group"
                        >
                          <span className="truncate">{loc.location}</span>
                          <span className="text-xs text-gray-400 group-hover:text-blue-600">
                            {loc.count} {loc.count === 1 ? 'property' : 'properties'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
