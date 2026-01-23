'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import ImageUpload, { ImageFile } from '@/components/ImageUpload'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import PurchasePhotosModal from '@/components/PurchasePhotosModal'
import { getPhotoLimitInfo } from '@/lib/photo-limits'

interface EditPropertyPageProps {
  params: Promise<{ id: string }>
}

export default function EditPropertyPage({ params }: EditPropertyPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [propertyId, setPropertyId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [images, setImages] = useState<ImageFile[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [propertyPlan, setPropertyPlan] = useState<string>('basic')
  const [maxImages, setMaxImages] = useState<number>(3)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
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
    availableFrom: '',
    parkingSpaces: '0',
    waterPrepaid: false,
    electricityPrepaid: false,
    depositMonths: '1',
    bankStatementsMonths: '3',
  })

  const availableAmenities = [
    'Air Conditioning',
    'Heating',
    'Swimming Pool',
    'Gym',
    'Laundry',
    'Dishwasher',
    'Balcony',
    'Garden',
    'Pet Friendly',
    'Furnished',
    'Hardwood Floors',
    'Carpet',
    'Security System',
    'Doorman',
    'Elevator',
    'Storage',
    'Bike Storage',
    'Package Room',
    'Outdoor Space',
    'Fireplace',
  ]

  useEffect(() => {
    const loadProperty = async () => {
      const resolvedParams = await params
      setPropertyId(resolvedParams.id)
      
      try {
        const response = await fetch(`/api/properties/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch property')
        }
        
        const data = await response.json()
        const property = data.property || data
        
        // Get property plan and limits
        setPropertyPlan(property.listingPlan || 'basic')
        setMaxImages(property.maxImages || 3)
        
        // Fetch wallet balance
        try {
          const walletResponse = await fetch('/api/wallet')
          if (walletResponse.ok) {
            const walletData = await walletResponse.json()
            setWalletBalance(walletData.wallet?.balance || 0)
          }
        } catch (err) {
          console.error('Failed to fetch wallet balance:', err)
        }
        
        setFormData({
          title: property.title || '',
          description: property.description || '',
          propertyType: property.propertyType || 'APARTMENT',
          price: property.price?.toString() || '',
          location: property.location || '',
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          country: property.country || '',
          postalCode: property.postalCode || '',
          latitude: property.latitude ? parseFloat(property.latitude) : undefined,
          longitude: property.longitude ? parseFloat(property.longitude) : undefined,
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          squareFeet: property.squareFeet?.toString() || '',
          availableFrom: property.availableFrom ? new Date(property.availableFrom).toISOString().split('T')[0] : '',
          parkingSpaces: property.parkingSpaces?.toString() || '0',
          waterPrepaid: property.waterPrepaid || false,
          electricityPrepaid: property.electricityPrepaid || false,
          depositMonths: property.depositMonths?.toString() || '1',
          bankStatementsMonths: property.bankStatementsMonths?.toString() || '3',
        })
        
        // Set amenities if they exist
        if (property.amenities && Array.isArray(property.amenities)) {
          setSelectedAmenities(property.amenities)
        }
        
        // Convert existing images to ImageFile format for display
        if (property.images && property.images.length > 0) {
          setExistingImages(property.images)
          const imageFiles: ImageFile[] = property.images.map((img: any, index: number) => ({
            id: img.id || `existing-${index}`,
            file: null as any, // No file for existing images
            preview: img.url,
            isPrimary: img.isPrimary || false,
          }))
          setImages(imageFiles)
        }
      } catch (err) {
        setError('Failed to load property')
      } finally {
        setLoading(false)
      }
    }
    
    loadProperty()
  }, [params])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const handlePurchaseSuccess = (newLimit: number, newBalance: number) => {
    setMaxImages(newLimit)
    setWalletBalance(newBalance)
  }

  const handleImageChange = (newImages: ImageFile[]) => {
    const photoLimitInfo = getPhotoLimitInfo(propertyPlan, newImages.length)
    
    // If trying to add more photos than the current limit
    if (newImages.length > images.length && newImages.length > maxImages) {
      // Check if user has wallet balance
      if (walletBalance >= 5) {
        setShowPurchaseModal(true)
      } else {
        alert(`You've reached your photo limit of ${maxImages}. You need wallet balance to add more photos (R5 per photo).`)
        return
      }
    }
    
    setImages(newImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate images
    if (images.length === 0) {
      setError('Please upload at least one image')
      return
    }

    setSaving(true)

    try {
      // Separate existing images from new uploads
      const newImages = images.filter(img => img.file !== null)
      const keptExistingImages = images.filter(img => img.file === null)

      // Convert new images to base64
      const newImagePromises = newImages.map(async (img) => {
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

      const newImageData = await Promise.all(newImagePromises)

      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
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
          availableFrom: formData.availableFrom ? new Date(formData.availableFrom).toISOString() : undefined,
          parkingSpaces: parseInt(formData.parkingSpaces) || 0,
          amenities: selectedAmenities,
          waterPrepaid: formData.waterPrepaid,
          electricityPrepaid: formData.electricityPrepaid,
          depositMonths: parseInt(formData.depositMonths),
          bankStatementsMonths: parseInt(formData.bankStatementsMonths),
          images: {
            existing: keptExistingImages.map(img => ({
              id: img.id,
              isPrimary: img.isPrimary,
            })),
            new: newImageData,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update property')
      } else {
        router.push('/owner/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      {/* Full-screen loading overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-900 font-medium text-lg">Saving changes...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-600 mt-1">
              Update the details of your property
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

            <Input
              type="date"
              name="availableFrom"
              label="Available From (Optional)"
              value={formData.availableFrom}
              onChange={handleChange}
            />

            <Input
              type="number"
              name="parkingSpaces"
              label="Parking Spaces"
              placeholder="0"
              min="0"
              max="20"
              value={formData.parkingSpaces}
              onChange={handleChange}
            />

            {/* Rental Requirements Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Requirements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="waterPrepaid"
                      checked={formData.waterPrepaid}
                      onChange={(e) => setFormData({ ...formData, waterPrepaid: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Water is Prepaid</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="electricityPrepaid"
                      checked={formData.electricityPrepaid}
                      onChange={(e) => setFormData({ ...formData, electricityPrepaid: e.target.checked })}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Electricity is Prepaid</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    name="depositMonths"
                    label="Deposit (Months)"
                    placeholder="1"
                    min="1"
                    max="12"
                    value={formData.depositMonths}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    type="number"
                    name="bankStatementsMonths"
                    label="Bank Statements (Months)"
                    placeholder="3"
                    min="1"
                    max="12"
                    value={formData.bankStatementsMonths}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Amenities
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {selectedAmenities.length} amenities selected
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">Photo Upload Limit</h4>
                    <p className="text-sm text-gray-600">Based on your {propertyPlan} plan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{images.length} / {maxImages}</p>
                    <p className="text-xs text-gray-500">photos uploaded</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (images.length / maxImages) * 100)}%` }}
                  />
                </div>
                {images.length >= maxImages && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ You've reached your limit! Need more photos? 
                      <button
                        type="button"
                        onClick={() => setShowPurchaseModal(true)}
                        className="font-semibold underline hover:text-yellow-900 ml-1"
                      >
                        Purchase extra slots for R5 each
                      </button>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your wallet balance: R{walletBalance.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <ImageUpload 
                images={images}
                onChange={handleImageChange}
                maxImages={maxImages}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Changes may require admin approval before being published.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
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

      <PurchasePhotosModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        propertyId={propertyId}
        currentPhotoCount={images.length}
        planLimit={maxImages}
        walletBalance={walletBalance}
        onPurchaseSuccess={handlePurchaseSuccess}
      />
    </>
  )
}
