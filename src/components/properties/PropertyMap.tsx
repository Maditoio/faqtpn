'use client'

import React, { useState, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
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
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
}

const defaultCenter = {
  lat: -26.2041, // Johannesburg, South Africa
  lng: 28.0473,
}

export function PropertyMap({ properties, center, zoom = 11 }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mapCenter, setMapCenter] = useState(center || defaultCenter)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  // Filter properties that have valid coordinates
  const validProperties = properties.filter(
    (p) => p.latitude && p.longitude && !isNaN(p.latitude) && !isNaN(p.longitude)
  )

  const onMarkerClick = useCallback((property: Property) => {
    setSelectedProperty(property)
  }, [])

  const onMapClick = useCallback(() => {
    setSelectedProperty(null)
  }, [])

  // Calculate map center based on properties
  React.useEffect(() => {
    if (validProperties.length > 0 && !center) {
      const avgLat =
        validProperties.reduce((sum, p) => sum + (p.latitude || 0), 0) / validProperties.length
      const avgLng =
        validProperties.reduce((sum, p) => sum + (p.longitude || 0), 0) / validProperties.length
      setMapCenter({ lat: avgLat, lng: avgLng })
    }
  }, [validProperties, center])

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <p className="text-gray-600">Map not available. API key not configured.</p>
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

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onClick={onMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={{
              lat: property.latitude!,
              lng: property.longitude!,
            }}
            onClick={() => onMarkerClick(property)}
            icon={{
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 0C11.716 0 5 6.716 5 15c0 11.25 15 35 15 35s15-23.75 15-35c0-8.284-6.716-15-15-15z" fill="#2563eb"/>
                  <circle cx="20" cy="15" r="8" fill="white"/>
                  <text x="20" y="20" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="bold">R</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 50),
            }}
          />
        ))}

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
    </LoadScript>
  )
}
