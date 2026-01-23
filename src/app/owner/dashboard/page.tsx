'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { IconButton } from '@/components/ui/IconButton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PlusIcon, EditIcon, TrashIcon, HeartIcon } from '@/components/icons/Icons'
import Link from 'next/link'
import { OwnerPropertyNav } from '@/components/owner/OwnerPropertyNav'

export default function OwnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rentingProperty, setRentingProperty] = useState<string | null>(null)
  const [showContactBanner, setShowContactBanner] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; propertyId: string | null; title: string }>({
    isOpen: false,
    propertyId: null,
    title: '',
  })
  const [rentDialog, setRentDialog] = useState<{ isOpen: boolean; propertyId: string | null; title: string }>({
    isOpen: false,
    propertyId: null,
    title: '',
  })
  const [deleting, setDeleting] = useState(false)
  const [notificationsSent, setNotificationsSent] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session && session.user.role !== 'HOME_OWNER' && session.user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchProperties()
    }
  }, [session, status, router])

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/owner/properties')
      const data = await response.json()
      setProperties(data.properties || [])
      
      // Check if user has contact info
      const profileResponse = await fetch('/api/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        const hasContactInfo = profileData.user.phone || profileData.user.whatsapp
        setShowContactBanner(!hasContactInfo && data.properties.length > 0)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      propertyId: id,
      title,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.propertyId) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/properties/${deleteDialog.propertyId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProperties()
        setDeleteDialog({ isOpen: false, propertyId: null, title: '' })
      }
    } catch (error) {
      console.error('Error deleting property:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleMarkAsRentedClick = (id: string, title: string) => {
    setRentDialog({
      isOpen: true,
      propertyId: id,
      title,
    })
  }

  const handleMarkAsRentedConfirm = async () => {
    if (!rentDialog.propertyId) return

    setRentingProperty(rentDialog.propertyId)
    try {
      const response = await fetch(`/api/properties/${rentDialog.propertyId}/rent`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setNotificationsSent(data.notificationsSent)
        await fetchProperties()
        setRentDialog({ isOpen: false, propertyId: null, title: '' })
      }
    } catch (error) {
      console.error('Error marking property as rented:', error)
    } finally {
      setRentingProperty(null)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'SUSPENDED':
        return 'danger'
      case 'RENTED':
        return 'default'
      default:
        return 'default'
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
      {/* Secondary Navigation */}
      <OwnerPropertyNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Info Banner */}
        {showContactBanner && (
          <Card className="mb-6 p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Add Your Contact Information
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Help potential renters reach you easily! Add your phone number and WhatsApp to your profile so they can contact you directly about your properties.
                </p>
                <div className="flex gap-2">
                  <Link href="/profile">
                    <Button variant="primary" size="sm">
                      Update Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowContactBanner(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowContactBanner(false)}
                className="flex-shrink-0 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage your property listings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold text-gray-900">
              {properties.length}
            </div>
            <div className="text-gray-600 mt-1">Total Properties</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {properties.filter((p) => p.status === 'APPROVED').length}
            </div>
            <div className="text-gray-600 mt-1">Active Listings</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-blue-600">
              {properties.filter((p) => p.status === 'RENTED').length}
            </div>
            <div className="text-gray-600 mt-1">Rented</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {properties.filter((p) => p.status === 'PENDING').length}
            </div>
            <div className="text-gray-600 mt-1">Pending Approval</div>
          </Card>
        </div>

        {/* Properties List */}
        {properties.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No properties yet</p>
            <Link href="/owner/properties/new">
              <Button variant="primary">Create Your First Property</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <Card key={property.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0].url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {property.title}
                        </h3>
                        <p className="text-gray-600">{property.location}</p>
                      </div>
                      <Badge variant={getStatusVariant(property.status)}>
                        {property.status}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(property.price)}/mo
                        </div>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="4" y="4" width="16" height="16" rx="2" />
                            </svg>
                            {property.bedrooms} beds
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="4" y="4" width="16" height="16" rx="2" />
                            </svg>
                            {property.bathrooms} baths
                          </span>
                          {property.parkingSpaces !== undefined && property.parkingSpaces > 0 && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                              </svg>
                              {property.parkingSpaces} parking
                            </span>
                          )}
                          {property._count && (
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="4" y="4" width="16" height="16" rx="2" />
                              </svg>
                              {property._count.favorites} favorites
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/properties/${property.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        {property.status === 'APPROVED' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleMarkAsRentedClick(property.id, property.title)}
                            disabled={rentingProperty === property.id}
                          >
                            {rentingProperty === property.id ? 'Processing...' : 'Mark as Rented'}
                          </Button>
                        )}
                        {property.status !== 'RENTED' && (
                          <>
                            <Link href={`/owner/properties/${property.id}/edit`}>
                              <IconButton
                                icon={<EditIcon className="w-5 h-5" />}
                                variant="secondary"
                                size="md"
                                label="Edit"
                              />
                            </Link>
                            <IconButton
                              icon={<TrashIcon className="w-5 h-5" />}
                              variant="danger"
                              size="md"
                              onClick={() => handleDeleteClick(property.id, property.title)}
                              label="Delete"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, propertyId: null, title: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Property?"
        message={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />

      {/* Mark as Rented Confirmation Dialog */}
      <ConfirmDialog
        isOpen={rentDialog.isOpen}
        onClose={() => setRentDialog({ isOpen: false, propertyId: null, title: '' })}
        onConfirm={handleMarkAsRentedConfirm}
        title="Mark as Rented?"
        message={`Are you sure you want to mark "${rentDialog.title}" as rented? All users who favorited this property will be notified that it's no longer available.`}
        confirmText="Mark as Rented"
        cancelText="Cancel"
        variant="warning"
        isLoading={rentingProperty !== null}
      />
    </div>
  )
}
