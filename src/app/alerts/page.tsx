'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import Link from 'next/link'

interface PropertyAlert {
  id: string
  name: string
  location?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  isActive: boolean
  notifyEmail: boolean
  notifyInApp: boolean
  matchCount: number
  lastTriggered?: string
  createdAt: string
}

export default function AlertsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alerts, setAlerts] = useState<PropertyAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; alertId: string | null; name: string }>({
    isOpen: false,
    alertId: null,
    name: '',
  })
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minBedrooms: '',
    minBathrooms: '',
    notifyEmail: true,
    notifyInApp: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchAlerts()
    }
  }, [session, status, router])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: any = {
      name: formData.name,
      notifyEmail: formData.notifyEmail,
      notifyInApp: formData.notifyInApp,
    }

    if (formData.location) payload.location = formData.location
    if (formData.propertyType) payload.propertyType = formData.propertyType
    if (formData.minPrice) payload.minPrice = Number(formData.minPrice)
    if (formData.maxPrice) payload.maxPrice = Number(formData.maxPrice)
    if (formData.minBedrooms) payload.minBedrooms = Number(formData.minBedrooms)
    if (formData.minBathrooms) payload.minBathrooms = Number(formData.minBathrooms)

    try {
      const url = editingAlert ? `/api/alerts/${editingAlert.id}` : '/api/alerts'
      const method = editingAlert ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchAlerts()
        resetForm()
        alert(editingAlert ? 'Alert updated!' : 'Alert created!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save alert')
      }
    } catch (error) {
      console.error('Error saving alert:', error)
      alert('Error saving alert')
    }
  }

  const handleEdit = (alert: PropertyAlert) => {
    setEditingAlert(alert)
    setFormData({
      name: alert.name,
      location: alert.location || '',
      propertyType: alert.propertyType || '',
      minPrice: alert.minPrice?.toString() || '',
      maxPrice: alert.maxPrice?.toString() || '',
      minBedrooms: alert.minBedrooms?.toString() || '',
      minBathrooms: alert.minBathrooms?.toString() || '',
      notifyEmail: alert.notifyEmail,
      notifyInApp: alert.notifyInApp,
    })
    setShowForm(true)
  }

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      alertId: id,
      name,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.alertId) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/alerts/${deleteDialog.alertId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAlerts()
        setDeleteDialog({ isOpen: false, alertId: null, name: '' })
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
    } finally {
      setDeleting(false)
    }
  }

  const toggleActive = async (alert: PropertyAlert) => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !alert.isActive }),
      })

      if (response.ok) {
        await fetchAlerts()
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      minBathrooms: '',
      notifyEmail: true,
      notifyInApp: true,
    })
    setEditingAlert(null)
    setShowForm(false)
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Property Alerts</h1>
            <p className="text-gray-600 mt-1">
              Manage your saved searches and get notified about new listings
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Create Alert'}
          </Button>
        </div>
        
        {/* Info Banner */}
        {alerts.length === 0 && !showForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  No alerts yet
                </p>
                <p className="text-sm text-blue-800">
                  The easiest way to create an alert is to <a href="/properties" className="underline font-medium">search for properties</a>. 
                  When you don't find what you're looking for, we'll offer to notify you when matching listings become available.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert Form */}
      {showForm && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingAlert ? 'Edit Alert' : 'Create New Alert'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="e.g., 2-bed apartments in Sandton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Johannesburg, Sandton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="COTTAGE">Cottage</option>
                <option value="BACKROOM">Backroom</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price (R)
                </label>
                <input
                  type="number"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price (R)
                </label>
                <input
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Bedrooms
                </label>
                <input
                  type="number"
                  value={formData.minBedrooms}
                  onChange={(e) => setFormData({ ...formData, minBedrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Bathrooms
                </label>
                <input
                  type="number"
                  value={formData.minBathrooms}
                  onChange={(e) => setFormData({ ...formData, minBathrooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  placeholder="Any"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notification Preferences
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyEmail"
                  checked={formData.notifyEmail}
                  onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notifyEmail" className="ml-2 text-sm text-gray-700">
                  Email notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyInApp"
                  checked={formData.notifyInApp}
                  onChange={(e) => setFormData({ ...formData, notifyInApp: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notifyInApp" className="ml-2 text-sm text-gray-700">
                  In-app notifications
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Alerts List */}
      <div>
        {alerts.length === 0 && !showForm ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">No alerts yet</p>
            <p className="text-gray-500 text-sm mb-6">
              Create your first alert to get notified about new properties
            </p>
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Create Your First Alert
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                      <Badge variant={alert.isActive ? 'success' : 'default'}>
                        {alert.isActive ? 'Active' : 'Paused'}
                      </Badge>
                      {alert.matchCount > 0 && (
                        <Badge variant="info">{alert.matchCount} matches</Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      {alert.location && <div>📍 {alert.location}</div>}
                      {alert.propertyType && <div>🏠 {alert.propertyType}</div>}
                      {(alert.minPrice || alert.maxPrice) && (
                        <div>
                          💰 {alert.minPrice ? `R${Number(alert.minPrice).toLocaleString()}` : '0'} - 
                          {alert.maxPrice ? ` R${Number(alert.maxPrice).toLocaleString()}` : ' No limit'}
                        </div>
                      )}
                      {alert.minBedrooms && <div>🛏️ {alert.minBedrooms}+ bedrooms</div>}
                      {alert.minBathrooms && <div>🚿 {alert.minBathrooms}+ bathrooms</div>}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div>Created: {new Date(alert.createdAt).toLocaleDateString()}</div>
                      {alert.lastTriggered && (
                        <div>Last matched: {new Date(alert.lastTriggered).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => toggleActive(alert)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                      title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                    >
                      {alert.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => handleEdit(alert)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit alert"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(alert.id, alert.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete alert"
                    >
                      🗑️
                    </button>
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
        onClose={() => setDeleteDialog({ isOpen: false, alertId: null, name: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Alert?"
        message={`Are you sure you want to delete the alert "${deleteDialog.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  )
}
