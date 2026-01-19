'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'

export default function NewPropertyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create property')
      } else {
        router.push('/owner/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details below to list your property
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              type="text"
              name="title"
              label="Property Title"
              placeholder="Beautiful 2-Bedroom Apartment"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <TextArea
              name="description"
              label="Description"
              placeholder="Describe your property..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                name="price"
                label="Monthly Rent ($)"
                placeholder="1500"
                value={formData.price}
                onChange={handleChange}
                required
              />

              <Input
                type="text"
                name="location"
                label="Location"
                placeholder="San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              type="text"
              name="address"
              label="Full Address (Optional)"
              placeholder="123 Main St, Apt 4B"
              value={formData.address}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                type="number"
                name="bedrooms"
                label="Bedrooms"
                placeholder="2"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />

              <Input
                type="number"
                name="bathrooms"
                label="Bathrooms"
                placeholder="1"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />

              <Input
                type="number"
                name="squareFeet"
                label="Square Feet (Optional)"
                placeholder="850"
                value={formData.squareFeet}
                onChange={handleChange}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Your property will be reviewed by our admin team before being published.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Property'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
