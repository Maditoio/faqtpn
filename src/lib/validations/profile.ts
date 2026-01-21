import { z } from 'zod'

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
})

export type UserProfileInput = z.infer<typeof userProfileSchema>
