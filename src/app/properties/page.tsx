'use client'

import React, { useState, useEffect } from 'react'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { PropertyMap } from '@/components/properties/PropertyMap'
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
  latitude?: number
  longitude?: number
  status: string
  images?: Array<{ url: string; altText?: string | null }>
  _count?: { favorites: number }
}

export default function PropertiesPage() {
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [popularLocations, setPopularLocations] = useState<Array<{ location: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
  })
  const [showFilters, setShowFilters] = useState(true)
  const [showAlertPrompt, setShowAlertPrompt] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [creatingAlert, setCreatingAlert] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

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
    setShowAlertPrompt(false)
    try {
      const params = new URLSearchParams()
      if (filters.location) params.append('location', filters.location)
      if (filters.propertyType) params.append('propertyType', filters.propertyType)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.bedrooms) params.append('bedrooms', filters.bedrooms)
      if (filters.bathrooms) params.append('bathrooms', filters.bathrooms)

      const response = await fetch(`/api/properties?${params}`)
      const data = await response.json()
      const results = data.properties || []
      setProperties(results)
      
      // Show alert prompt if user searched with filters and got no/few results
      const hasActiveFilters = filters.location || filters.propertyType || filters.minPrice || filters.bedrooms
      if (searchPerformed && hasActiveFilters && results.length <= 2 && session) {
        setShowAlertPrompt(true)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationClick = (location: string) => {
    setFilters({ ...filters, location })
    setTimeout(() => fetchProperties(), 0)
  }

  const handleSearch = () => {
    setSearchPerformed(true)
    fetchProperties()
  }

  const handleCreateAlert = async () => {
    if (!session) {
      alert('Please sign in to create alerts')
      return
    }

    setCreatingAlert(true)
    try {
      // Enable consent and create alert in one flow
      const consentResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertsConsent: true }),
      })

      if (!consentResponse.ok) {
        throw new Error('Failed to enable alerts')
      }

      // Create alert from current search
      const alertName = `${filters.bedrooms ? filters.bedrooms + '-bed ' : ''}${filters.propertyType || 'Properties'} in ${filters.location || 'your area'}`
      
      const alertData: any = {
        name: alertName.trim(),
        notifyEmail: true,
        notifyInApp: true,
      }

      if (filters.location) alertData.location = filters.location
      if (filters.propertyType) alertData.propertyType = filters.propertyType
      if (filters.minPrice) alertData.minPrice = Number(filters.minPrice)
      if (filters.maxPrice) alertData.maxPrice = Number(filters.maxPrice)
      if (filters.bedrooms) alertData.minBedrooms = Number(filters.bedrooms)
      if (filters.bathrooms) alertData.minBathrooms = Number(filters.bathrooms)

      const alertResponse = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      })

      if (alertResponse.ok) {
        setShowAlertPrompt(false)
        alert(`✓ Alert created! We'll notify you when ${alertName.toLowerCase()} become available.`)
      } else {
        const data = await alertResponse.json()
        alert(data.error || 'Failed to create alert')
      }
    } catch (error) {
      console.error('Error creating alert:', error)
      alert('Failed to create alert. Please try again.')
    } finally {
      setCreatingAlert(false)
    }
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter location or area..."
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full h-[42px] px-4 py-2 border border-gray-300 rounded-sm focus:border-orange-500 hover:border-orange-400 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="w-full sm:w-56">
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full h-[42px] px-4 py-2 border border-gray-300 rounded-sm focus:border-orange-500 hover:border-orange-400 outline-none transition-colors text-gray-900"
              >
                <option value="">All Types</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="COTTAGE">Cottage</option>
                <option value="BACKROOM">Backroom</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="INDUSTRIAL_PROPERTY">Industrial</option>
                <option value="COMMERCIAL_PROPERTY">Commercial</option>
              </select>
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

      {/* View Mode Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
          </p>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </div>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Properties Grid + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Properties Grid/Map - Left Side */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : viewMode === 'map' ? (
              <PropertyMap properties={properties} />
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-900 text-xl font-semibold mb-2">No properties found</p>
                <p className="text-gray-500 text-sm mb-6">
                  {searchPerformed ? 'No listings match your search criteria right now.' : 'Try adjusting your search criteria'}
                </p>
                
                {/* Contextual Alert Prompt */}
                {showAlertPrompt && (
                  <div className="mt-8 max-w-md mx-auto bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-left">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 text-lg mb-1">
                          Want us to alert you?
                        </h3>
                        <p className="text-blue-800 text-sm mb-4">
                          We'll notify you instantly when a property matching your search becomes available
                          {filters.location && ` in ${filters.location}`}.
                        </p>
                        <div className="bg-white rounded-lg p-3 mb-4 border border-blue-100">
                          <p className="text-xs font-medium text-gray-600 mb-2">Your search criteria:</p>
                          <div className="space-y-1 text-sm text-gray-700">
                            {filters.location && <div>• Location: {filters.location}</div>}
                            {filters.propertyType && <div>• Type: {filters.propertyType}</div>}
                            {filters.bedrooms && <div>• Bedrooms: {filters.bedrooms}+</div>}
                            {filters.minPrice && <div>• Min Price: R{Number(filters.minPrice).toLocaleString()}</div>}
                            {filters.maxPrice && <div>• Max Price: R{Number(filters.maxPrice).toLocaleString()}</div>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={handleCreateAlert}
                            disabled={creatingAlert}
                            className="flex-1"
                          >
                            {creatingAlert ? 'Creating...' : 'Yes, notify me'}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setShowAlertPrompt(false)}
                            disabled={creatingAlert}
                          >
                            No thanks
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                </div>
                
                {/* Show alert prompt for few results (1-2) */}
                {showAlertPrompt && properties.length <= 2 && (
                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Only {properties.length} listing{properties.length > 1 ? 's' : ''} found
                        </p>
                        <p className="text-sm text-blue-800 mb-3">
                          Get notified when more properties matching your search become available.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleCreateAlert}
                            disabled={creatingAlert}
                          >
                            {creatingAlert ? 'Creating...' : 'Create alert'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAlertPrompt(false)}
                            disabled={creatingAlert}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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
                        propertyType: '',
                        minPrice: '',
                        maxPrice: '',
                        bedrooms: '',
                        bathrooms: '',
                      })
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
