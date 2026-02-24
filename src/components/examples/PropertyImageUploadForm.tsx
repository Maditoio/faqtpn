'use client'

import { FormEvent, useState } from 'react'
import type { PropertyImageDto } from '@/types/property-images'

interface PropertyImageUploadFormProps {
  propertyId: string
  onUploaded?: (image: PropertyImageDto) => void
}

export default function PropertyImageUploadForm({ propertyId, onUploaded }: PropertyImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      setError('Please select an image')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('isFeatured', String(isFeatured))

      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error || 'Image upload failed')
      }

      const payload = (await response.json()) as { image: PropertyImageDto }
      onUploaded?.(payload.image)
      setFile(null)
      setIsFeatured(false)
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Image upload failed'
      setError(message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={isUploading}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) => setIsFeatured(event.target.checked)}
          disabled={isUploading}
        />
        Featured image
      </label>

      {error ? <p className="text-red-500">{error}</p> : null}

      <button type="submit" disabled={!file || isUploading} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {isUploading ? 'Uploading...' : 'Upload image'}
      </button>
    </form>
  )
}
