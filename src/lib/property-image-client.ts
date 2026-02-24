export interface ClientImageFile {
  id: string
  file: File | null
  preview: string
  isPrimary: boolean
}

export interface ApiPropertyImage {
  id: string
  imageUrl: string
  isFeatured: boolean
  order: number
  url: string
  isPrimary: boolean
}

async function parseApiError(response: Response, fallbackMessage: string): Promise<never> {
  const payload = (await response.json().catch(() => ({}))) as { error?: string }
  throw new Error(payload.error || fallbackMessage)
}

export function mapApiImagesToClientImages(images: ApiPropertyImage[]): ClientImageFile[] {
  return images.map((image) => ({
    id: image.id,
    file: null,
    preview: image.url,
    isPrimary: image.isPrimary,
  }))
}

export async function syncPropertyImages(propertyId: string, desiredImages: ClientImageFile[]): Promise<ApiPropertyImage[]> {
  const listResponse = await fetch(`/api/properties/${propertyId}/images`, { method: 'GET' })

  if (!listResponse.ok) {
    await parseApiError(listResponse, 'Failed to fetch existing property images')
  }

  const listPayload = (await listResponse.json()) as { images: ApiPropertyImage[] }
  const serverImages = listPayload.images
  const serverImageIds = new Set(serverImages.map((image) => image.id))

  const keepServerImageIds = new Set(
    desiredImages
      .filter((image) => image.file === null && serverImageIds.has(image.id))
      .map((image) => image.id)
  )

  const imagesToDelete = serverImages.filter((image) => !keepServerImageIds.has(image.id))

  for (const image of imagesToDelete) {
    const deleteResponse = await fetch(`/api/properties/${propertyId}/images/${image.id}`, {
      method: 'DELETE',
    })

    if (!deleteResponse.ok) {
      await parseApiError(deleteResponse, 'Failed to delete property image')
    }
  }

  const syncedImages: ApiPropertyImage[] = []

  for (let index = 0; index < desiredImages.length; index += 1) {
    const image = desiredImages[index]

    if (image.file) {
      const formData = new FormData()
      formData.append('file', image.file)
      formData.append('isFeatured', String(image.isPrimary))
      formData.append('order', String(index))

      const uploadResponse = await fetch(`/api/properties/${propertyId}/images`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        await parseApiError(uploadResponse, 'Failed to upload property image')
      }

      const uploadPayload = (await uploadResponse.json()) as { image: ApiPropertyImage }
      syncedImages.push(uploadPayload.image)
      continue
    }

    if (serverImageIds.has(image.id)) {
      const updateResponse = await fetch(`/api/properties/${propertyId}/images/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFeatured: image.isPrimary,
          order: index,
        }),
      })

      if (!updateResponse.ok) {
        await parseApiError(updateResponse, 'Failed to update property image metadata')
      }

      const updatePayload = (await updateResponse.json()) as { image: ApiPropertyImage }
      syncedImages.push(updatePayload.image)
    }
  }

  return syncedImages.sort((left, right) => left.order - right.order)
}
