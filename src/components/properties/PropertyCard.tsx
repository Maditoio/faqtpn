'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { Badge } from '@/components/ui/Badge'
import { HeartIcon, LocationIcon, SquareIcon } from '@/components/icons/Icons'
import { useRouter } from 'next/navigation'

interface PropertyCardProps {
  property: {
    id: string
    title: string
    description: string
    propertyType?: string
    price: number
    location: string
    bedrooms: number
    bathrooms: number
    parkingSpaces?: number | null
    status: string
    availableFrom?: string | null
    images?: Array<{ url: string; altText?: string | null }>
    _count?: { favorites: number }
  }
  isFavorited?: boolean
  onFavoriteToggle?: (propertyId: string) => void
  showStatus?: boolean
}

export function PropertyCard({
  property,
  isFavorited = false,
  onFavoriteToggle,
  showStatus = false,
}: PropertyCardProps) {
  const router = useRouter()
  const [localFavorited, setLocalFavorited] = useState(isFavorited)
  const primaryImage = property.images?.[0]?.url || '/placeholder-property.jpg'

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalFavorited(!localFavorited)
    onFavoriteToggle?.(property.id)
  }

  const handleCardClick = () => {
    router.push(`/properties/${property.id}`)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'SUSPENDED':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <Card className="overflow-hidden" onClick={handleCardClick}>
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        
        {/* Favorite Button - Circular */}
        <div className="absolute top-3 right-3">
          <IconButton
            icon={<HeartIcon className="w-5 h-5" filled={localFavorited} />}
            variant={localFavorited ? 'danger' : 'ghost'}
            size="md"
            onClick={handleFavoriteClick}
            label={localFavorited ? 'Remove from favorites' : 'Add to favorites'}
          />
        </div>

        {/* Status Badge */}
        {showStatus && (
          <div className="absolute top-3 left-3">
            <Badge variant={getStatusVariant(property.status)}>
              {property.status}
            </Badge>
          </div>
        )}

        {/* Property Type Badge */}
        {property.propertyType && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-white bg-opacity-90 text-gray-700 text-xs font-medium rounded">
              {property.propertyType.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {property.title}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center mr-2">
            <LocationIcon className="w-3 h-3" />
          </div>
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Details */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <SquareIcon className="w-4 h-4" />
              {property.bedrooms} Beds
            </span>
            <span className="flex items-center gap-1">
              <SquareIcon className="w-4 h-4" />
              {property.bathrooms} Baths
            </span>
            <span className="flex items-center gap-1">
              <SquareIcon className="w-4 h-4" />
              {property.parkingSpaces || 0} Parking
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(property.price)}
              </span>
              <span className="text-gray-600 text-sm">/month</span>
            </div>
            {property.availableFrom && new Date(property.availableFrom) > new Date() && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Available {new Date(property.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
