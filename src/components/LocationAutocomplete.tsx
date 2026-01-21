'use client'

import React, { useEffect, useRef, useState } from 'react'

interface LocationData {
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  latitude: number
  longitude: number
  formattedAddress: string
}

interface LocationAutocompleteProps {
  onLocationSelect: (location: LocationData) => void
  defaultValue?: string
  placeholder?: string
  required?: boolean
  label?: string
  className?: string
}

// Extend the Window interface to include google
declare global {
  interface Window {
    google: any
    initAutocomplete: () => void
  }
}

export default function LocationAutocomplete({
  onLocationSelect,
  defaultValue = '',
  placeholder = 'Enter location',
  required = false,
  label = 'Location',
  className = '',
}: LocationAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [inputValue, setInputValue] = useState(defaultValue)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true)
      initializeAutocomplete()
      return
    }

    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Google Maps API key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file')
      return
    }

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setIsLoaded(true)
      initializeAutocomplete()
    }
    script.onerror = () => {
      console.error('Failed to load Google Maps script')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      initializeAutocomplete()
    }
  }, [isLoaded])

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    // Create autocomplete instance
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
    })

    autocompleteRef.current = autocomplete

    // Add place changed listener
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()

      if (!place.geometry || !place.geometry.location) {
        console.error('No details available for input: ', place.name)
        return
      }

      // Extract location components
      const addressComponents = place.address_components || []
      const locationData: LocationData = {
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        formattedAddress: place.formatted_address || '',
      }

      // Parse address components
      addressComponents.forEach((component: any) => {
        const types = component.types

        if (types.includes('street_number')) {
          locationData.address = component.long_name + ' '
        }
        if (types.includes('route')) {
          locationData.address += component.long_name
        }
        if (types.includes('locality')) {
          locationData.city = component.long_name
        }
        if (types.includes('administrative_area_level_1')) {
          locationData.state = component.short_name
        }
        if (types.includes('country')) {
          locationData.country = component.long_name
        }
        if (types.includes('postal_code')) {
          locationData.postalCode = component.long_name
        }
      })

      // Clean up address field
      locationData.address = locationData.address.trim()

      // Update input value with formatted address
      setInputValue(place.formatted_address || '')

      // Call the callback with extracted data
      onLocationSelect(locationData)
    })
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor="location-autocomplete" className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id="location-autocomplete"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:border-orange-500 hover:border-orange-400 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
        autoComplete="off"
      />
      {!isLoaded && (
        <p className="text-xs text-gray-500 mt-1">Loading location service...</p>
      )}
      {isLoaded === false && !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <p className="text-xs text-red-500 mt-1">
          Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
        </p>
      )}
    </div>
  )
}
