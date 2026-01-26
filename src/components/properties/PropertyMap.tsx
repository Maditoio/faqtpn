'use client'

import React, { useState, useCallback, useRef } from 'react'
import { GoogleMap, useLoadScript, Marker, InfoWindow, MarkerClusterer } from '@react-google-maps/api'
import Link from 'next/link'
import Image from 'next/image'

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
  images?: Array<{ url: string; altText?: string | null }>
}

interface PropertyMapProps {
  properties: Property[]
  center?: { lat: number; lng: number }
  zoom?: number
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
}

const defaultCenter = {
  lat: -26.2041, // Johannesburg, South Africa
  lng: 28.0473,
}

const clusterStyles = [
  {
    textColor: 'white',
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="28" fill="#2563eb" opacity="0.8"/>
        <circle cx="30" cy="30" r="20" fill="#1e40af"/>
      </svg>
    `),
    height: 60,
    width: 60,
  },
]

export function PropertyMap({ properties, center, zoom = 11, onBoundsChanged }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapCenter, setMapCenter] = useState(center || defaultCenter)
  const [showSearchButton, setShowSearchButton] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  })

  // Filter properties that have valid coordinates and convert to numbers
  const validProperties = properties
    .map((p) => ({
      ...p,
      latitude: p.latitude ? Number(p.latitude) : undefined,
      longitude: p.longitude ? Number(p.longitude) : undefined,
    }))
    .filter(
      (p) =>
        p.latitude !== undefined &&
        p.longitude !== undefined &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude) &&
        isFinite(p.latitude) &&
        isFinite(p.longitude)
    )

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property)
  }, [])

  const onMapClick = useCallback(() => {
    setSelectedProperty(null)
  }, [])

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
    
    // Fit bounds to show all properties with animation
    if (validProperties.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      validProperties.forEach((property) => {
        bounds.extend({
          lat: property.latitude!,
          lng: property.longitude!,
        })
      })
      
      // Add padding and animate to fit all properties
      map.fitBounds(bounds, {
        top: 80,
        bottom: 80,
        left: 80,
        right: 80,
      })
    }
  }, [validProperties])

  const onBoundsChangedHandler = useCallback(() => {
    if (mapRef.current) {
      setShowSearchButton(true)
    }
  }, [])

  const handleSearchArea = useCallback(() => {
    if (mapRef.current && onBoundsChanged) {
      const bounds = mapRef.current.getBounds()
      if (bounds) {
        onBoundsChanged(bounds)
        setShowSearchButton(false)
      }
    }
  }, [onBoundsChanged])

  // Fit bounds when properties change
  React.useEffect(() => {
    if (mapRef.current && validProperties.length > 0) {
      const bounds = new google.maps.LatLngBounds()
      validProperties.forEach((property) => {
        bounds.extend({
          lat: property.latitude!,
          lng: property.longitude!,
        })
      })
      
      // Animate to fit all properties
      mapRef.current.fitBounds(bounds, {
        top: 80,
        bottom: 80,
        left: 80,
        right: 80,
      })
    }
  }, [validProperties.length])

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <p className="text-gray-600">Map not available. API key not configured.</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <p className="text-gray-600">Error loading maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  if (validProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-gray-600 text-lg font-medium">No properties with locations</p>
        <p className="text-gray-500 text-sm mt-1">Properties need valid coordinates to show on map</p>
      </div>
    )
  }

  const markerIcon = {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C11.716 0 5 6.716 5 15c0 11.25 15 35 15 35s15-23.75 15-35c0-8.284-6.716-15-15-15z" fill="#2563eb"/>
        <circle cx="20" cy="15" r="8" fill="white"/>
        <text x="20" y="20" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="bold">R</text>
      </svg>
    `),
    scaledSize: typeof google !== 'undefined' ? new google.maps.Size(40, 50) : undefined,
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onClick={onMapClick}
        onLoad={onLoad}
        onBoundsChanged={onBoundsChangedHandler}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
        }}
      >
        <MarkerClusterer
          options={{
            styles: clusterStyles,
            maxZoom: 15,
          }}
        >
          {(clusterer) => (
            <>
              {validProperties.map((property) => (
                <Marker
                  key={property.id}
                  position={{
                    lat: property.latitude!,
                    lng: property.longitude!,
                  }}
                  onClick={() => onMarkerClick(property)}
                  icon={markerIcon}
                  clusterer={clusterer}
                />
              ))}
            </>
          )}
        </MarkerClusterer>

        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.latitude!,
              lng: selectedProperty.longitude!,
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="max-w-xs">
              <Link href={`/properties/${selectedProperty.id}`} className="block">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={selectedProperty.images[0].url}
                      alt={selectedProperty.images[0].altText || selectedProperty.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                
                <h3 className="font-bold text-gray-900 mb-1 hover:text-blue-600">
                  {selectedProperty.title}
                </h3>
                
                <p className="text-lg font-bold text-blue-600 mb-1">
                  R{selectedProperty.price.toLocaleString()}/month
                </p>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <span>{selectedProperty.bedrooms} bed</span>
                  <span>•</span>
                  <span>{selectedProperty.bathrooms} bath</span>
                </div>
                
                <p className="text-xs text-gray-500 mb-2">
                  {selectedProperty.location}
                </p>
                
                <p className="text-blue-600 text-sm font-medium hover:underline">
                  View Details →
                </p>
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {showSearchButton && (
        <button
          onClick={handleSearchArea}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-white shadow-lg px-4 py-2 rounded-full font-medium text-gray-900 hover:bg-gray-50 transition-colors border border-gray-200 z-10"
        >
          Search this area
        </button>
      )}
    </div>
  )
}
