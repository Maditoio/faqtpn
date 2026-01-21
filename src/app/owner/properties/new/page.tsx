'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ImageUpload, { ImageFile } from '@/components/ImageUpload'
import LocationAutocomplete from '@/components/LocationAutocomplete'

export default function NewPropertyPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'APARTMENT',
    price: '',
    location: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    parkingSpaces: '',
    availableFrom: '',
  })

  const availableAmenities = [
    'Air Conditioning',
    'Heating',
    'Swimming Pool',
    'Gym/Fitness Center',
    'Laundry in Unit',
    'Dishwasher',
    'Balcony/Patio',
    'Garden/Yard',
    'Pet Friendly',
    'Furnished',
    'Hardwood Floors',
    'Carpet',
    'Security System',
    'Doorman',
    'Elevator',
    'Storage Space',
    'Bike Storage',
    'Package Room',
    'Outdoor Space',
    'Fireplace',
  ]

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLocationSelect = (locationData: any) => {
    setFormData({
      ...formData,
      location: locationData.city || locationData.formattedAddress,
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      postalCode: locationData.postalCode,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate images
    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setLoading(true)

    try {
      // Convert images to base64
      const imagePromises = images.map(async (img) => {
        return new Promise<{ data: string; isPrimary: boolean }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve({
              data: reader.result as string,
              isPrimary: img.isPrimary,
            })
          }
          reader.onerror = reject
          reader.readAsDataURL(img.file)
        })
      })

      const imageData = await Promise.all(imagePromises)

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          propertyType: formData.propertyType,
          price: parseFloat(formData.price),
          location: formData.location,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          country: formData.country || undefined,
          postalCode: formData.postalCode || undefined,
          latitude: formData.latitude,
          longitude: formData.longitude,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          squareFeet: formData.squareFeet ? parseInt(formData.squareFeet) : undefined,
          parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : 0,
          amenities: selectedAmenities,
          availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : undefined,
          images: imageData,
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
    <>
      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-900 font-medium text-lg">Creating property...</p>
          </div>
        </div>
      )}

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

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="COTTAGE">Cottage</option>
                <option value="BACKROOM">Backroom</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="INDUSTRIAL_PROPERTY">Industrial Property</option>
                <option value="COMMERCIAL_PROPERTY">Commercial Property</option>
              </select>
            </div>

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
            </div>

            <LocationAutocomplete
              onLocationSelect={handleLocationSelect}
              defaultValue={formData.location}
              placeholder="Start typing an address..."
              required
              label="Property Location"
            />

            {formData.city && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Location:</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {formData.address && <p><span className="font-medium">Address:</span> {formData.address}</p>}
                  {formData.city && <p><span className="font-medium">City:</span> {formData.city}</p>}
                  {formData.state && <p><span className="font-medium">State:</span> {formData.state}</p>}
                  {formData.country && <p><span className="font-medium">Country:</span> {formData.country}</p>}
                  {formData.postalCode && <p><span className="font-medium">Postal Code:</span> {formData.postalCode}</p>}
                </div>
              </div>
            )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                name="parkingSpaces"
                label="Parking Spaces"
                placeholder="1"
                value={formData.parkingSpaces}
                onChange={handleChange}
              />

              <Input
                type="date"
                name="availableFrom"
                label="Available From (Optional)"
                value={formData.availableFrom}
                onChange={handleChange}
              />
            </div>

            {/* Amenities Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-sm border-2 text-sm font-medium transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              {selectedAmenities.length > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  {selectedAmenities.length} amenities selected
                </p>
              )}
            </div>

            <ImageUpload 
              images={images}
              onChange={setImages}
              maxImages={15}
            />

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
    </>
  )
}
