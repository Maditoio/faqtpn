'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { IconButton } from '@/components/ui/IconButton'
import { CheckIcon, XIcon, TrashIcon } from '@/components/icons/Icons'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{ id: string; action: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties')
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set())
  const [detailViewProperty, setDetailViewProperty] = useState<any | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [session, status, router, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'properties') {
        const response = await fetch('/api/admin/properties')
        const data = await response.json()
        setProperties(data.properties || [])
      } else {
        const response = await fetch('/api/admin/users')
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePropertyAction = async (id: string, action: 'APPROVE' | 'SUSPEND' | 'DELETE') => {
    setActionLoading({ id, action })
    try {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        await fetchData()
        setSelectedProperties(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedProperties.size === 0) return
    
    setActionLoading({ id: 'bulk', action: 'APPROVE' })
    try {
      const response = await fetch('/api/admin/properties/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyIds: Array.from(selectedProperties) }),
      })

      if (response.ok) {
        await fetchData()
        setSelectedProperties(new Set())
      }
    } catch (error) {
      console.error('Error bulk approving:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const togglePropertySelection = (id: string) => {
    setSelectedProperties(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    const pendingProperties = properties.filter(p => p.status === 'PENDING')
    if (selectedProperties.size === pendingProperties.length && pendingProperties.length > 0) {
      setSelectedProperties(new Set())
    } else {
      setSelectedProperties(new Set(pendingProperties.map(p => p.id)))
    }
  }

  const handleUserToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error updating user:', error)
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
    <>
      {/* Full-screen loading overlay for actions */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-900 font-medium text-lg">
              {actionLoading.action === 'APPROVE' && 'Approving property...'}
              {actionLoading.action === 'SUSPEND' && 'Suspending property...'}
              {actionLoading.action === 'DELETE' && 'Deleting property...'}
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage properties and users</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('properties')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
            </div>
            <Button
              onClick={() => router.push('/admin/settings')}
              variant="outline"
              className="mb-4"
            >
              Settings
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'properties' ? (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {properties.some(p => p.status === 'PENDING') && (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProperties.size > 0 && selectedProperties.size === properties.filter(p => p.status === 'PENDING').length}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Select All Pending ({properties.filter(p => p.status === 'PENDING').length})
                      </span>
                    </label>
                    {selectedProperties.size > 0 && (
                      <span className="text-sm text-gray-600">
                        {selectedProperties.size} selected
                      </span>
                    )}
                  </div>
                  {selectedProperties.size > 0 && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleBulkApprove}
                      disabled={actionLoading !== null}
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Approve Selected ({selectedProperties.size})
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {properties.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No properties to review</p>
              </Card>
            ) : (
              properties.map((property) => (
                <Card key={property.id} className="p-6">
                  <div className="flex gap-6">
                    {/* Checkbox */}
                    {property.status === 'PENDING' && (
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedProperties.has(property.id)}
                          onChange={() => togglePropertySelection(property.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-6 flex-1">
                      {/* Image */}
                      <div className="w-full md:w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setDetailViewProperty(property)}>
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                              onClick={() => setDetailViewProperty(property)}>
                              {property.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Owner: {property.owner.name} ({property.owner.email})
                            </p>
                            <p className="text-gray-600">{property.location}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant={getStatusVariant(property.status)}>
                              {property.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailViewProperty(property)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {property.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xl font-bold text-blue-600">
                              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(property.price)}/mo
                            </div>
                            <div className="text-sm text-gray-600">
                              {property.bedrooms} beds • {property.bathrooms} baths
                              {property.images && ` • ${property.images.length} images`}
                            </div>
                          </div>

                          <div className="flex gap-2">
                          {property.status === 'PENDING' && (
                            <>
                              <IconButton
                                icon={<CheckIcon className="w-5 h-5" />}
                                variant="primary"
                                size="md"
                                onClick={() => handlePropertyAction(property.id, 'APPROVE')}
                                label="Approve"
                              />
                              <IconButton
                                icon={<XIcon className="w-5 h-5" />}
                                variant="secondary"
                                size="md"
                                onClick={() => handlePropertyAction(property.id, 'SUSPEND')}
                                label="Suspend"
                              />
                            </>
                          )}
                          {property.status === 'APPROVED' && (
                            <IconButton
                              icon={<XIcon className="w-5 h-5" />}
                              variant="danger"
                              size="md"
                              onClick={() => handlePropertyAction(property.id, 'SUSPEND')}
                              label="Suspend"
                            />
                          )}
                          {property.status === 'SUSPENDED' && (
                            <IconButton
                              icon={<CheckIcon className="w-5 h-5" />}
                              variant="primary"
                              size="md"
                              onClick={() => handlePropertyAction(property.id, 'APPROVE')}
                              label="Approve"
                            />
                          )}
                          <IconButton
                            icon={<TrashIcon className="w-5 h-5" />}
                            variant="danger"
                            size="md"
                            onClick={() => handlePropertyAction(property.id, 'DELETE')}
                            label="Delete"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {users.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No users found</p>
              </Card>
            ) : (
              users.map((user) => (
                <Card key={user.id} className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={user.role === 'SUPER_ADMIN' ? 'danger' : 'default'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.isActive ? 'success' : 'danger'}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {user._count.properties} properties • {user._count.favorites} favorites
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {user.role !== 'SUPER_ADMIN' && (
                        <Button
                          variant={user.isActive ? 'danger' : 'primary'}
                          size="sm"
                          onClick={() => handleUserToggle(user.id, user.isActive)}
                        >
                          {user.isActive ? 'Suspend' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}  
        </div>
      </div>

      {/* Detailed Property Review Modal */}
      {detailViewProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex justify-between items-center rounded-t-xl z-10">
              <h2 className="text-2xl font-bold text-white">Property Review</h2>
              <button
                onClick={() => setDetailViewProperty(null)}
                className="text-white hover:text-gray-200 text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Property Header */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{detailViewProperty.title}</h3>
                    <p className="text-lg text-gray-700 mb-2">{detailViewProperty.location}</p>
                    <p className="text-sm text-gray-800 bg-gray-100 inline-block px-3 py-1 rounded-full">
                      Owner: {detailViewProperty.owner.name} • {detailViewProperty.owner.email}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(detailViewProperty.status)} className="text-base px-4 py-2 font-semibold">
                    {detailViewProperty.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">Price</p>
                    <p className="text-xl font-bold text-blue-600">
                      {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(detailViewProperty.price)}/mo
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-800 mb-1">Bedrooms</p>
                    <p className="text-xl font-bold text-gray-900">{detailViewProperty.bedrooms}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-800 mb-1">Bathrooms</p>
                    <p className="text-xl font-bold text-gray-900">{detailViewProperty.bathrooms}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-800 mb-1">Square Feet</p>
                    <p className="text-xl font-bold text-gray-900">{detailViewProperty.squareFeet || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Image Gallery with Quality Check */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span>Images ({detailViewProperty.images?.length || 0})</span>
                  {detailViewProperty.images?.length === 0 && (
                    <span className="text-sm font-semibold text-red-600 ml-3 bg-red-50 px-3 py-1 rounded-full">⚠️ No images uploaded</span>
                  )}
                </h4>
                {detailViewProperty.images && detailViewProperty.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {detailViewProperty.images.map((image: any, index: number) => (
                      <div key={image.id || index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Property ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 group-hover:border-blue-500 transition-colors cursor-pointer shadow-sm"
                          onClick={() => window.open(image.url, '_blank')}
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                            Primary
                          </div>
                        )}
                        <button
                          onClick={() => window.open(image.url, '_blank')}
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                        >
                          <span className="text-white font-bold text-lg">🔍 View Full Size</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                    <p className="text-yellow-900 font-semibold">⚠️ No images available for this property.</p>
                  </div>
                )}
              </div>

              {/* Property Description */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Description</h4>
                <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{detailViewProperty.description}</p>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Property Details</h4>
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <dt className="text-gray-800 font-medium">Type:</dt>
                      <dd className="font-bold text-gray-900">{detailViewProperty.propertyType}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <dt className="text-gray-800 font-medium">Parking Spaces:</dt>
                      <dd className="font-bold text-gray-900">{detailViewProperty.parkingSpaces || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <dt className="text-gray-800 font-medium">Available From:</dt>
                      <dd className="font-bold text-gray-900">
                        {detailViewProperty.availableFrom 
                          ? new Date(detailViewProperty.availableFrom).toLocaleDateString()
                          : 'Immediately'}
                      </dd>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <dt className="text-gray-800 font-medium">Favorites:</dt>
                      <dd className="font-bold text-gray-900">{detailViewProperty._count?.favorites || 0}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Amenities</h4>
                  {detailViewProperty.amenities && detailViewProperty.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {detailViewProperty.amenities.map((amenity: string, index: number) => (
                        <span key={index} className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-lg text-sm border border-blue-200">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 text-base bg-gray-50 p-4 rounded-lg">No amenities listed</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-6 border-t-2 border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setDetailViewProperty(null)}
                  className="font-semibold"
                >
                  Close
                </Button>
                {detailViewProperty.status === 'PENDING' && (
                  <>
                    <Button
                      variant="danger"
                      size="lg"
                      onClick={() => {
                        handlePropertyAction(detailViewProperty.id, 'SUSPEND')
                        setDetailViewProperty(null)
                      }}
                      className="font-semibold"
                    >
                      <XIcon className="w-5 h-5 mr-2" />
                      Reject Property
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        handlePropertyAction(detailViewProperty.id, 'APPROVE')
                        setDetailViewProperty(null)
                      }}
                      className="font-semibold bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="w-5 h-5 mr-2" />
                      Approve Property
                    </Button>
                  </>
                )}
                {detailViewProperty.status === 'APPROVED' && (
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => {
                      handlePropertyAction(detailViewProperty.id, 'SUSPEND')
                      setDetailViewProperty(null)
                    }}
                    className="font-semibold"
                  >
                    <XIcon className="w-5 h-5 mr-2" />
                    Suspend Property
                  </Button>
                )}
                {detailViewProperty.status === 'SUSPENDED' && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      handlePropertyAction(detailViewProperty.id, 'APPROVE')
                      setDetailViewProperty(null)
                    }}
                    className="font-semibold bg-green-600 hover:bg-green-700"
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Approve Property
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
