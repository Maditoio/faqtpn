'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { LocationIcon, HeartIcon, SquareIcon } from '@/components/icons/Icons'
import dynamic from 'next/dynamic'

const PropertyMap = dynamic(
  () => import('@/components/property/PropertyMap').then((mod) => mod.PropertyMap),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center"><LoadingSpinner /></div> }
)

interface Property {
  id: string
  title: string
  description: string
  propertyType?: string
  price: number
  location: string
  address: string | null
  bedrooms: number
  bathrooms: number
  squareFeet: number | null
  parkingSpaces?: number
  amenities?: string[]
  availableFrom: string | null
  waterPrepaid: boolean
  electricityPrepaid: boolean
  depositMonths: number
  bankStatementsMonths: number
  status: string
  createdAt: string
  latitude?: number | string | null
  longitude?: number | string | null
  images?: Array<{ url: string; altText?: string | null; isPrimary?: boolean }>
  owner: {
    id: string
    name: string
    email: string
    phone?: string | null
    whatsapp?: string | null
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(0)

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

  const openLightbox = (index: number) => {
    setLightboxImage(index)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
  }

  const nextImage = () => {
    if (!property?.images) return
    const images = property.images.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    setLightboxImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    if (!property?.images) return
    const images = property.images.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    setLightboxImage((prev) => (prev - 1 + images.length) % images.length)
  }

  // Handle ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, property])

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
    ? property.images.sort((a: any, b: any) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Property Content - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Image Gallery */}
          <div className="relative group cursor-pointer" onClick={() => openLightbox(selectedImage)}>
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].altText || property.title}
              className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Expand Icon Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 p-3 rounded-full">
                <svg className="w-8 h-8 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image Counter and Dots */}
            {images.length > 1 && (
              <>
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                  {selectedImage + 1} / {images.length}
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(index)
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        selectedImage === index ? 'bg-white w-8' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
              {images.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Property Details */}
          <div className="p-8">
            <div className="flex justify-between items-start gap-6 mb-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 truncate" title={property.title}>{property.title}</h1>
                  {property.propertyType && (
                    <Badge variant="default" className="flex-shrink-0">
                      {property.propertyType.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <LocationIcon className="w-5 h-5 mr-2" />
                  <span>{property.location}</span>
                </div>
                {property.address && (
                  <p className="text-sm text-gray-500">{property.address}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-bold text-blue-600 mb-2 whitespace-nowrap">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(property.price)}<span className="text-lg text-gray-500">/mo</span>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleFavoriteToggle}
                  className="flex items-center gap-2"
                >
                  <HeartIcon className="w-5 h-5" filled={isFavorited} />
                </Button>
              </div>
            </div>

            {/* Property Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Bedrooms</div>
                <div className="flex items-center gap-2">
                  <SquareIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{property.bedrooms}</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Bathrooms</div>
                <div className="flex items-center gap-2">
                  <SquareIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{property.bathrooms}</span>
                </div>
              </div>
              {property.squareFeet && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Square Feet</div>
                  <div className="flex items-center gap-2">
                    <SquareIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-2xl font-bold text-gray-900">
                      {property.squareFeet.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">Parking</div>
                <div className="flex items-center gap-2">
                  <SquareIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{property.parkingSpaces || 0}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-sm"
                    >
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Badge */}
            {property.availableFrom && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-green-900">
                    {new Date(property.availableFrom) > new Date() 
                      ? `Available from ${new Date(property.availableFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                      : 'Available now'}
                  </span>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Rental Requirements */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Rental Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Water</p>
                    <p className="text-xs text-gray-600">{property.waterPrepaid ? 'Prepaid' : 'Billed Monthly'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Electricity</p>
                    <p className="text-xs text-gray-600">{property.electricityPrepaid ? 'Prepaid' : 'Billed Monthly'}</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Deposit Required</p>
                    <p className="text-xs text-gray-600">{property.depositMonths} {property.depositMonths === 1 ? 'month' : 'months'} rent</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bank Statements</p>
                    <p className="text-xs text-gray-600">{property.bankStatementsMonths} {property.bankStatementsMonths === 1 ? 'month' : 'months'} required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Posted Date */}
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted on {new Date(property.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Location Map */}
            {property.latitude && property.longitude && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location
                </h2>
                <PropertyMap
                  latitude={typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude}
                  longitude={typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude}
                  title={property.title}
                  address={property.address || property.location}
                />
                <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                  <LocationIcon className="w-4 h-4" />
                  {property.address || property.location}
                </p>
              </div>
            )}
          </div>
            </div>
          </div>

          {/* Owner Info - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Listed by</h2>
              <div className="flex items-center gap-3 mb-4">
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

              {/* Contact Methods */}
              {session ? (
                <div className="space-y-3">
                  {/* Email */}
                  <a
                    href={`mailto:${property.owner.email}`}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Email</div>
                      <div className="text-sm text-gray-600">{property.owner.email}</div>
                    </div>
                  </a>

                  {/* Phone */}
                  {property.owner.phone && (
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Phone</div>
                        <div className="text-sm text-gray-600">{property.owner.phone}</div>
                      </div>
                    </a>
                  )}

                  {/* WhatsApp */}
                  {property.owner.whatsapp && (
                    <a
                      href={`https://wa.me/${property.owner.whatsapp.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in your property: ${property.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                      title="Contact via WhatsApp"
                    >
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                </div>
              ) : (
                <div className="mt-4">
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

      {/* Image Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 bg-black/50 rounded-full hover:bg-black/70 z-50"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-50">
            {lightboxImage + 1} / {images.length}
          </div>

          {/* Main Image Container */}
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxImage].url}
              alt={images[lightboxImage].altText || property.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scaleIn"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all hover:scale-110"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-4 rounded-full transition-all hover:scale-110"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-3xl overflow-x-auto">
              <div className="flex gap-3 px-4">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightboxImage(index)
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-3 transition-all transform hover:scale-110 ${
                      lightboxImage === index
                        ? 'border-white shadow-lg shadow-white/50 scale-105'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-6 right-6 text-white/60 text-sm hidden md:block">
            Press ESC to close • Use arrow keys to navigate
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
