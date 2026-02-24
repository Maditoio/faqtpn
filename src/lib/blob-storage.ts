import { del, put } from '@vercel/blob'

function getBlobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured')
  }
  return token
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .toLowerCase()
}

export async function uploadPropertyImageToBlob(params: {
  propertyId: string
  file: File
}) {
  const { propertyId, file } = params
  const safeName = sanitizeFileName(file.name || 'image')
  const pathname = `properties/${propertyId}/${crypto.randomUUID()}-${safeName}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
    token: getBlobToken(),
    contentType: file.type,
  })

  return blob
}

export async function deletePropertyImageFromBlob(imageUrl: string) {
  await del(imageUrl, { token: getBlobToken() })
}
