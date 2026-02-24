export interface PropertyImageDto {
  id: string
  imageUrl: string
  isFeatured: boolean
  order: number
  createdAt: string
  url: string
  isPrimary: boolean
}

export interface UploadPropertyImageResponse {
  image: PropertyImageDto
}

export interface PropertyWithOrderedImages {
  id: string
  title: string
  images: PropertyImageDto[]
}
