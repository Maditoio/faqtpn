import { z } from 'zod'

// Authentication Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['USER', 'HOME_OWNER']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Property Schemas
export const propertySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'TOWNHOUSE', 'COTTAGE', 'BACKROOM', 'WAREHOUSE', 'INDUSTRIAL_PROPERTY', 'COMMERCIAL_PROPERTY']),
  price: z.number().positive('Price must be positive').max(1000000),
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(0).max(20),
  squareFeet: z.number().int().positive().optional(),
  parkingSpaces: z.number().int().min(0).max(20).optional(),
  amenities: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  availableFrom: z.union([z.string(), z.date()]).transform(val => {
    if (typeof val === 'string') return new Date(val)
    return val
  }).optional(),
  waterPrepaid: z.boolean().optional(),
  electricityPrepaid: z.boolean().optional(),
  depositMonths: z.number().int().min(1).max(12).optional(),
  bankStatementsMonths: z.number().int().min(1).max(12).optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'SUSPENDED', 'RENTED', 'DELETED']).optional(),
})

// Relaxed schema for drafts - only title is required
export const draftPropertySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'TOWNHOUSE', 'COTTAGE', 'BACKROOM', 'WAREHOUSE', 'INDUSTRIAL_PROPERTY', 'COMMERCIAL_PROPERTY']).optional(),
  price: z.number().positive().max(1000000).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  squareFeet: z.number().int().positive().optional(),
  parkingSpaces: z.number().int().min(0).max(20).optional(),
  amenities: z.array(z.string()).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  availableFrom: z.union([z.string(), z.date()]).transform(val => {
    if (typeof val === 'string') return new Date(val)
    return val
  }).optional(),
  waterPrepaid: z.boolean().optional(),
  electricityPrepaid: z.boolean().optional(),
  depositMonths: z.number().int().min(1).max(12).optional(),
  bankStatementsMonths: z.number().int().min(1).max(12).optional(),
  status: z.literal('DRAFT').optional(),
})

export const propertyUpdateSchema = propertySchema.partial()

// Property Image Schema
export const propertyImageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  altText: z.string().optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().int().optional(),
})

// Search & Filter Schema
export const propertySearchSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'TOWNHOUSE', 'COTTAGE', 'BACKROOM', 'WAREHOUSE', 'INDUSTRIAL_PROPERTY', 'COMMERCIAL_PROPERTY']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

// User Update Schema
export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
})

// Admin Action Schema
export const adminActionSchema = z.object({
  action: z.enum(['APPROVE', 'SUSPEND', 'DELETE']),
  reason: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
export type PropertyImageInput = z.infer<typeof propertyImageSchema>
export type PropertySearchInput = z.infer<typeof propertySearchSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type AdminActionInput = z.infer<typeof adminActionSchema>
