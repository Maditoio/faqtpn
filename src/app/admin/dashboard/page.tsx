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
      }
    } catch (error) {
      console.error('Error updating property:', error)
    } finally {
      setActionLoading(null)
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
        </div>

        {/* Content */}
        {activeTab === 'properties' ? (
          <div className="space-y-4">
            {properties.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No properties to review</p>
              </Card>
            ) : (
              properties.map((property) => (
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
                          <p className="text-sm text-gray-600">
                            Owner: {property.owner.name} ({property.owner.email})
                          </p>
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
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0 }).format(property.price)}/mo
                          </div>
                          <div className="text-sm text-gray-600">
                            {property.bedrooms} beds • {property.bathrooms} baths
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
    </>
  )
}
