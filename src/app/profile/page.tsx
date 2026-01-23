'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  role: string
  alertsConsent: boolean
  alertsConsentDate: string | null
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAlertsDialog, setShowAlertsDialog] = useState(false)
  const [updatingAlerts, setUpdatingAlerts] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          whatsapp: data.user.whatsapp || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setProfile(data.user)
        alert('Profile updated successfully!')
      } else {
        if (data.details) {
          const newErrors: Record<string, string> = {}
          data.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message
          })
          setErrors(newErrors)
        } else {
          alert(data.error || 'Failed to update profile')
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleToggleAlerts = async () => {
    setUpdatingAlerts(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertsConsent: !profile?.alertsConsent }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setShowAlertsDialog(false)
      }
    } catch (error) {
      console.error('Error updating alerts consent:', error)
    } finally {
      setUpdatingAlerts(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Profile not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and contact details</p>
        </div>

        <Card className="p-6">
          {/* Profile Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {profile.role.toLowerCase().replace('_', ' ')} • Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Your phone number will be displayed to users viewing your properties
              </p>
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp Number
              </label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+15551234567"
              />
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Enter in international format (e.g., +15551234567). Users can contact you via WhatsApp.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Alerts Settings Card */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Alerts</h3>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">Alert Notifications</h4>
                  {profile.alertsConsent && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Enabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Receive notifications when new properties match your saved search criteria and preferred areas.
                </p>
                {profile.alertsConsentDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Enabled on {new Date(profile.alertsConsentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <Button
                variant={profile.alertsConsent ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  if (profile.alertsConsent) {
                    setShowAlertsDialog(true)
                  } else {
                    handleToggleAlerts()
                  }
                }}
              >
                {profile.alertsConsent ? 'Disable' : 'Enable'}
              </Button>
            </div>

            {profile.alertsConsent && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/alerts"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  Manage your alerts
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Why add contact information?</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Make it easier for potential renters to reach you</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Respond faster to inquiries via phone or WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Build trust with verified contact information</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your contact info is only visible to logged-in users</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Alerts Consent Dialog */}
      <ConfirmDialog
        isOpen={showAlertsDialog}
        onClose={() => setShowAlertsDialog(false)}
        onConfirm={handleToggleAlerts}
        title="Disable Property Alerts?"
        message="Are you sure you want to disable alerts? Your saved alerts will not send notifications until you re-enable them."
        confirmText="Disable Alerts"
        cancelText="Keep Enabled"
        variant="warning"
        isLoading={updatingAlerts}
      />
    </div>
  )
}
