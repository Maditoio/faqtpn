'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TextArea } from '@/components/ui/TextArea'
import ImageUpload, { ImageFile } from '@/components/ImageUpload'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import PricingSelector, { pricingPlans } from '@/components/property/PricingSelector'
import { CheckIcon } from '@/components/icons/Icons'
import { useToast } from '@/components/ui/Toast'

interface PropertyWizardProps {
  draftId?: string
  initialData?: any
}

const steps = [
  { id: 1, name: 'Basic Info', description: 'Property title and type' },
  { id: 2, name: 'Location', description: 'Where is your property?' },
  { id: 3, name: 'Details', description: 'Bedrooms, bathrooms, etc.' },
  { id: 4, name: 'Pricing', description: 'Set your rental price' },
  { id: 5, name: 'Requirements', description: 'Deposit and utilities' },
  { id: 6, name: 'Amenities', description: 'Additional features' },
  { id: 7, name: 'Listing Plan', description: 'Choose your plan' },
  { id: 8, name: 'Photos', description: 'Upload property images' },
]

export default function PropertyWizard({ draftId, initialData }: PropertyWizardProps) {
  const router = useRouter()
  const { showToast, ToastComponent } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [listingPlan, setListingPlan] = useState('basic')
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [propertyId, setPropertyId] = useState<string | undefined>(draftId)
  const [images, setImages] = useState<ImageFile[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' })
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [useWallet, setUseWallet] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card')
  
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
    waterPrepaid: false,
    electricityPrepaid: false,
    depositMonths: '1',
    bankStatementsMonths: '3',
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

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        propertyType: initialData.propertyType || 'APARTMENT',
        price: initialData.price?.toString() || '',
        location: initialData.location || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        postalCode: initialData.postalCode || '',
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        bedrooms: initialData.bedrooms?.toString() || '',
        bathrooms: initialData.bathrooms?.toString() || '',
        squareFeet: initialData.squareFeet?.toString() || '',
        parkingSpaces: initialData.parkingSpaces?.toString() || '',
        availableFrom: initialData.availableFrom ? new Date(initialData.availableFrom).toISOString().split('T')[0] : '',
        waterPrepaid: initialData.waterPrepaid || false,
        electricityPrepaid: initialData.electricityPrepaid || false,
        depositMonths: initialData.depositMonths?.toString() || '1',
        bankStatementsMonths: initialData.bankStatementsMonths?.toString() || '3',
      })
      
      if (initialData.amenities) {
        setSelectedAmenities(initialData.amenities)
      }
      
      if (initialData.images) {
        const imageFiles: ImageFile[] = initialData.images.map((img: any, index: number) => ({
          id: img.id || `existing-${index}`,
          file: null as any,
          preview: img.url,
          isPrimary: img.isPrimary || false,
        }))
        setImages(imageFiles)
      }

      // Calculate which step to start on based on completed fields
      const nextStep = calculateNextStep(initialData)
      setCurrentStep(nextStep)
    }
  }, [initialData])

  // Fetch wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch('/api/owner/wallet')
        if (response.ok) {
          const data = await response.json()
          setWalletBalance(data.wallet?.balance || 0)
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error)
      }
    }
    fetchWalletBalance()
  }, [])

  // Calculate the next incomplete step based on data
  const calculateNextStep = (data: any) => {
    // Step 1: Basic Info (title and description)
    if (!data.title || data.title.length < 5 || !data.description || data.description.length < 20) {
      return 1
    }
    
    // Step 2: Location
    if (!data.city || !data.country) {
      return 2
    }
    
    // Step 3: Details (bedrooms, bathrooms)
    if (!data.bedrooms || !data.bathrooms) {
      return 3
    }
    
    // Step 4: Pricing
    if (!data.price || parseFloat(data.price) <= 0) {
      return 4
    }
    
    // Step 5: Requirements (deposit and bank statements)
    if (!data.depositMonths || !data.bankStatementsMonths) {
      return 5
    }
    
    // Step 6: Amenities (optional, so check if we have images)
    if (!data.images || data.images.length === 0) {
      return 6 // Let them add amenities before photos
    }
    
    // Step 7: Photos
    if (!data.images || data.images.length === 0) {
      return 7
    }
    
    // All steps complete, go to last step for review
    return 7
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep > 1 && formData.title) {
        autoSaveDraft()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData, currentStep, selectedAmenities, images])

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

  const autoSaveDraft = async () => {
    setAutoSaving(true)
    try {
      await saveDraft()
      setLastSaved(new Date())
    } catch (error: any) {
      console.error('Auto-save failed:', error)
      showToast(error.message || 'Auto-save failed', 'error')
    } finally {
      setAutoSaving(false)
    }
  }

  const saveDraft = async () => {
    console.log('💾 Saving draft...', { title: formData.title, propertyId })
    
    const draftData: any = {
      title: formData.title,
      status: 'DRAFT',
    }

    // Add optional fields only if they have values
    if (formData.description) draftData.description = formData.description
    if (formData.propertyType) draftData.propertyType = formData.propertyType
    if (formData.price) draftData.price = parseFloat(formData.price)
    if (formData.location) draftData.location = formData.location
    if (formData.address) draftData.address = formData.address
    if (formData.city) draftData.city = formData.city
    if (formData.state) draftData.state = formData.state
    if (formData.country) draftData.country = formData.country
    if (formData.postalCode) draftData.postalCode = formData.postalCode
    if (formData.latitude) draftData.latitude = formData.latitude
    if (formData.longitude) draftData.longitude = formData.longitude
    if (formData.bedrooms) draftData.bedrooms = parseInt(formData.bedrooms)
    if (formData.bathrooms) draftData.bathrooms = parseInt(formData.bathrooms)
    if (formData.squareFeet) draftData.squareFeet = parseInt(formData.squareFeet)
    if (formData.parkingSpaces) draftData.parkingSpaces = parseInt(formData.parkingSpaces)
    if (formData.availableFrom) draftData.availableFrom = new Date(formData.availableFrom).toISOString()
    if (formData.waterPrepaid !== undefined) draftData.waterPrepaid = formData.waterPrepaid
    if (formData.electricityPrepaid !== undefined) draftData.electricityPrepaid = formData.electricityPrepaid
    if (formData.depositMonths) draftData.depositMonths = parseInt(formData.depositMonths)
    if (formData.bankStatementsMonths) draftData.bankStatementsMonths = parseInt(formData.bankStatementsMonths)
    if (selectedAmenities.length > 0) draftData.amenities = selectedAmenities

    console.log('📝 Draft data prepared:', draftData)

    // Handle images
    let imageData: any = undefined
    if (images.length > 0) {
      const newImages = images.filter(img => img.file !== null)
      const keptExistingImages = images.filter(img => img.file === null)

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
      
      if (propertyId) {
        imageData = {
          existing: keptExistingImages.map(img => ({
            id: img.id,
            isPrimary: img.isPrimary,
          })),
          new: newImageData,
        }
      } else {
        imageData = newImageData
      }
    }

    const url = propertyId 
      ? `/api/properties/${propertyId}`
      : '/api/properties'
    
    const method = propertyId ? 'PATCH' : 'POST'

    console.log('🚀 Sending request:', { url, method, hasImages: !!imageData })

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...draftData,
        ...(imageData && { images: imageData }),
      }),
    })

    console.log('📡 Response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Save failed:', errorData)
      throw new Error(errorData.error || `Failed to save draft (${response.status})`)
    }

    const data = await response.json()
    console.log('✅ Draft saved successfully:', data)
    
    if (!propertyId && data.property?.id) {
      setPropertyId(data.property.id)
      console.log('🆔 Property ID set:', data.property.id)
    }

    return data
  }

  const handleSaveAndExit = async () => {
    if (!formData.title || formData.title.trim() === '') {
      showToast('Please enter a property title before saving', 'warning')
      return
    }

    setSaving(true)
    try {
      await saveDraft()
      showToast('Draft saved successfully!', 'success')
      // Wait a moment so user sees the success message
      setTimeout(() => {
        router.push('/owner/properties/drafts')
      }, 1000)
    } catch (error: any) {
      console.error('Failed to save:', error)
      showToast(error.message || 'Failed to save draft. Please try again.', 'error')
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!canProceed()) {
      alert('Please fill in all required fields')
      return
    }

    // Show payment modal instead of submitting directly
    setShowPaymentModal(true)
  }

  const validateCardNumber = (number: string): boolean => {
    // Remove spaces and check if it's 16 digits
    const cleaned = number.replace(/\s/g, '')
    if (!/^\d{16}$/.test(cleaned)) {
      setCardErrors(prev => ({ ...prev, cardNumber: 'Card number must be 16 digits' }))
      return false
    }
    
    // Luhn algorithm for card validation
    let sum = 0
    let isEven = false
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i])
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
      isEven = !isEven
    }
    
    if (sum % 10 !== 0) {
      setCardErrors(prev => ({ ...prev, cardNumber: 'Invalid card number' }))
      return false
    }
    
    setCardErrors(prev => ({ ...prev, cardNumber: '' }))
    return true
  }

  const validateExpiryDate = (expiry: string): boolean => {
    const cleaned = expiry.replace(/\//g, '')
    if (!/^\d{4}$/.test(cleaned)) {
      setCardErrors(prev => ({ ...prev, expiryDate: 'Format: MM/YY' }))
      return false
    }
    
    const month = parseInt(cleaned.substring(0, 2))
    const year = parseInt('20' + cleaned.substring(2, 4))
    
    if (month < 1 || month > 12) {
      setCardErrors(prev => ({ ...prev, expiryDate: 'Invalid month' }))
      return false
    }
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setCardErrors(prev => ({ ...prev, expiryDate: 'Card expired' }))
      return false
    }
    
    setCardErrors(prev => ({ ...prev, expiryDate: '' }))
    return true
  }

  const validateCVV = (cvvValue: string): boolean => {
    if (!/^\d{3,4}$/.test(cvvValue)) {
      setCardErrors(prev => ({ ...prev, cvv: 'CVV must be 3 or 4 digits' }))
      return false
    }
    setCardErrors(prev => ({ ...prev, cvv: '' }))
    return true
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.substring(0, 19) // Max 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
    }
    return cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    // Clear errors as user types
    if (cardErrors.cardNumber) {
      setCardErrors(prev => ({ ...prev, cardNumber: '' }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setExpiryDate(formatted)
    if (formatted.length === 5) {
      validateExpiryDate(formatted)
    } else if (cardErrors.expiryDate) {
      setCardErrors(prev => ({ ...prev, expiryDate: '' }))
    }
  }

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4)
    setCvv(value)
    if (value.length >= 3) {
      validateCVV(value)
    } else if (cardErrors.cvv) {
      setCardErrors(prev => ({ ...prev, cvv: '' }))
    }
  }

  const handlePayment = async () => {
    // If paying with wallet, skip card validation
    if (paymentMethod === 'wallet') {
      const listingPrice = pricingPlans.find(p => p.id === listingPlan)?.price || 0
      if (walletBalance < listingPrice) {
        showToast('Insufficient wallet balance', 'error')
        return
      }
      
      setIsProcessing(true)
      setShowPaymentModal(false)
      
      // Submit property with wallet payment
      await submitProperty(true)
      return
    }
    
    // Validate card fields for card payment
    const isCardValid = validateCardNumber(cardNumber)
    const isExpiryValid = validateExpiryDate(expiryDate)
    const isCVVValid = validateCVV(cvv)
    
    if (!isCardValid || !isExpiryValid || !isCVVValid) {
      showToast('Please correct the card details', 'error')
      return
    }
    
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    setShowPaymentModal(false)
    
    // Now submit the property after payment
    await submitProperty(false)
  }

  const submitProperty = async (useWalletPayment: boolean = false) => {
    setSaving(true)
    try {
      const selectedPlanData = pricingPlans.find(p => p.id === listingPlan)
      
      // Update status to PENDING for submission
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        price: parseFloat(formData.price),
        location: formData.location || formData.city || '',
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: selectedAmenities,
        status: 'PENDING',
        // Add pricing plan data
        listingPlan: listingPlan,
        maxImages: selectedPlanData?.maxImages || 3,
        listingPrice: selectedPlanData?.price || 49,
        paymentStatus: 'paid', // Simulated payment
        paidAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months from now
      }

      // Add optional location fields
      if (formData.address) submitData.address = formData.address
      if (formData.city) submitData.city = formData.city
      if (formData.state) submitData.state = formData.state
      if (formData.country) submitData.country = formData.country
      if (formData.postalCode) submitData.postalCode = formData.postalCode
      if (formData.latitude) submitData.latitude = formData.latitude
      if (formData.longitude) submitData.longitude = formData.longitude

      // Add optional property details
      if (formData.squareFeet) submitData.squareFeet = parseInt(formData.squareFeet)
      if (formData.parkingSpaces) submitData.parkingSpaces = parseInt(formData.parkingSpaces)
      if (formData.availableFrom) submitData.availableFrom = new Date(formData.availableFrom).toISOString()

      // Add rental requirements
      if (formData.waterPrepaid !== undefined) submitData.waterPrepaid = formData.waterPrepaid
      if (formData.electricityPrepaid !== undefined) submitData.electricityPrepaid = formData.electricityPrepaid
      if (formData.depositMonths) submitData.depositMonths = parseInt(formData.depositMonths)
      if (formData.bankStatementsMonths) submitData.bankStatementsMonths = parseInt(formData.bankStatementsMonths)

      // Handle images
      let imageData: any = undefined
      if (images.length > 0) {
        const newImages = images.filter(img => img.file !== null)
        const keptExistingImages = images.filter(img => img.file === null)

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
        
        if (propertyId) {
          imageData = {
            existing: keptExistingImages.map(img => ({
              id: img.id,
              isPrimary: img.isPrimary,
            })),
            new: newImageData,
          }
        } else {
          imageData = newImageData
        }
      }

      const url = propertyId 
        ? `/api/properties/${propertyId}`
        : '/api/properties'
      
      const method = propertyId ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...submitData,
          ...(imageData && { images: imageData }),
          paymentMethod: useWalletPayment ? 'wallet' : 'card',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Submission error details:', {
          status: response.status,
          error: error,
          submitData: submitData,
        })
        
        // Show detailed error message
        if (error.details && Array.isArray(error.details)) {
          const errorMessages = error.details.map((detail: any) => 
            `${detail.path.join('.')}: ${detail.message}`
          ).join('\n')
          throw new Error(`Validation failed:\n${errorMessages}`)
        }
        
        throw new Error(error.error || 'Failed to submit property')
      }

      router.push('/owner/dashboard')
    } catch (error: any) {
      console.error('Full submission error:', error)
      alert(error.message || 'Failed to submit property')
    } finally {
      setSaving(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.length >= 5 && formData.description.length >= 20
      case 2:
        return formData.city && formData.country
      case 3:
        return formData.bedrooms && formData.bathrooms
      case 4:
        return formData.price && parseFloat(formData.price) > 0
      case 5:
        return formData.depositMonths && formData.bankStatementsMonths
      case 6:
        return true // Amenities are optional
      case 7:
        return listingPlan !== '' // Pricing plan must be selected
      case 8:
        return images.length > 0 && images.length <= (pricingPlans.find(p => p.id === listingPlan)?.maxImages || 3)
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {propertyId ? 'Continue Listing' : 'List Your Property'}
            </h1>
            {autoSaving && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                Saving...
              </div>
            )}
            {!autoSaving && lastSaved && (
              <div className="text-sm text-gray-500">
                Last saved {Math.round((Date.now() - lastSaved.getTime()) / 1000)}s ago
              </div>
            )}
          </div>

          {/* Step Indicators */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-xs font-medium text-center hidden sm:block">
                    <div className={step.id === currentStep ? 'text-blue-600' : 'text-gray-600'}>
                      {step.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-0">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].name}
            </h2>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <Input
                  name="title"
                  label="Property Title"
                  placeholder="Beautiful 2BR apartment in downtown"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <TextArea
                  name="description"
                  label="Description"
                  placeholder="Describe your property in detail..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              </>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <>
                <LocationAutocomplete
                  onLocationSelect={handleLocationSelect}
                  defaultValue={formData.location}
                  placeholder="Start typing an address..."
                  required
                  label="Property Location"
                />

                {formData.city && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Selected Location:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                      {formData.address && <p><span className="font-medium">Address:</span> {formData.address}</p>}
                      {formData.city && <p><span className="font-medium">City:</span> {formData.city}</p>}
                      {formData.state && <p><span className="font-medium">State:</span> {formData.state}</p>}
                      {formData.country && <p><span className="font-medium">Country:</span> {formData.country}</p>}
                      {formData.postalCode && <p><span className="font-medium">Postal Code:</span> {formData.postalCode}</p>}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="col-span-2"
                />
              </div>
            )}

            {/* Step 4: Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <Input
                  type="number"
                  name="price"
                  label="Monthly Rent"
                  placeholder="1500"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Tip:</strong> Research similar properties in your area to set a competitive price.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Requirements */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <input
                        type="checkbox"
                        name="waterPrepaid"
                        checked={formData.waterPrepaid}
                        onChange={(e) => setFormData({ ...formData, waterPrepaid: e.target.checked })}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Water is Prepaid</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
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

                  <div className="grid grid-cols-1 gap-4">
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
            )}

            {/* Step 6: Amenities */}
            {currentStep === 6 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableAmenities.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
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
                  <p className="text-sm text-gray-500 mt-4">
                    {selectedAmenities.length} amenities selected
                  </p>
                )}
              </div>
            )}

            {/* Step 7: Listing Plan */}
            {currentStep === 7 && (
              <div>
                <PricingSelector 
                  selectedPlan={listingPlan}
                  onSelectPlan={setListingPlan}
                />
              </div>
            )}

            {/* Step 8: Photos */}
            {currentStep === 8 && (
              <div>
                <ImageUpload 
                  images={images}
                  onChange={setImages}
                  maxImages={pricingPlans.find(p => p.id === listingPlan)?.maxImages || 3}
                />
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> You can upload up to {pricingPlans.find(p => p.id === listingPlan)?.maxImages || 3} images with your {pricingPlans.find(p => p.id === listingPlan)?.name || 'Basic'} plan. High-quality photos attract more renters!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="secondary"
            onClick={handleSaveAndExit}
            disabled={saving || !formData.title}
            title={!formData.title ? 'Enter a title first' : 'Save draft and exit'}
          >
            {saving ? 'Saving...' : 'Save Draft & Exit'}
          </Button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="secondary"
                onClick={handlePrevious}
                disabled={saving}
              >
                Previous
              </Button>
            )}

            {currentStep < steps.length ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed() || saving}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!canProceed() || saving}
              >
                {saving ? 'Submitting...' : 'Continue to Payment'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Complete Your Payment</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-900 font-semibold text-lg">
                  {pricingPlans.find(p => p.id === listingPlan)?.name} Plan
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  R{pricingPlans.find(p => p.id === listingPlan)?.price}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Up to {pricingPlans.find(p => p.id === listingPlan)?.maxImages} images • 3 months listing
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    R{pricingPlans.find(p => p.id === listingPlan)?.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet Balance Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Wallet Balance</p>
                  <p className="text-xl font-semibold text-gray-900">R{walletBalance.toFixed(2)}</p>
                </div>
                {walletBalance >= (pricingPlans.find(p => p.id === listingPlan)?.price || 0) && (
                  <span className="text-sm text-gray-600">Available</span>
                )}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  disabled={walletBalance < (pricingPlans.find(p => p.id === listingPlan)?.price || 0)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    paymentMethod === 'wallet'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${
                    walletBalance < (pricingPlans.find(p => p.id === listingPlan)?.price || 0)
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Wallet</div>
                  <div className="text-xs text-gray-600 mt-1">Use wallet credits</div>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border rounded-lg text-left transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold text-gray-900">Card</div>
                  <div className="text-xs text-gray-600 mt-1">Credit or debit card</div>
                </button>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-gray-700 text-sm">
                <strong>Demo Mode:</strong> This is a simulation. No actual payment will be processed.
              </p>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  onBlur={() => {
                    const cleaned = cardNumber.replace(/\s/g, '')
                    if (cleaned.length > 0 && cleaned.length !== 16) {
                      setCardErrors(prev => ({ ...prev, cardNumber: 'Card number must be 16 digits' }))
                    } else if (cleaned.length === 16) {
                      validateCardNumber(cardNumber)
                    }
                  }}
                  className={`w-full px-4 py-3 border ${cardErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900 placeholder-gray-500`}
                  disabled={isProcessing}
                />
                {cardErrors.cardNumber && (
                  <p className="text-red-600 text-sm mt-1">{cardErrors.cardNumber}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    onBlur={() => expiryDate && validateExpiryDate(expiryDate)}
                    maxLength={5}
                    className={`w-full px-4 py-3 border ${cardErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500`}
                    disabled={isProcessing}
                  />
                  {cardErrors.expiryDate && (
                    <p className="text-red-600 text-sm mt-1">{cardErrors.expiryDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCVVChange}
                    onBlur={() => cvv && validateCVV(cvv)}
                    maxLength={4}
                    className={`w-full px-4 py-3 border ${cardErrors.cvv ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500`}
                    disabled={isProcessing}
                  />
                  {cardErrors.cvv && (
                    <p className="text-red-600 text-sm mt-1">{cardErrors.cvv}</p>
                  )}
                </div>
              </div>
            </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1 bg-gray-900 hover:bg-gray-800"
              >
                {isProcessing ? (
                  'Processing...'
                ) : paymentMethod === 'wallet' ? (
                  'Pay with Wallet'
                ) : (
                  'Complete Payment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  )
}
