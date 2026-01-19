/**
 * Security Utilities
 * OWASP Best Practices Implementation
 */

/**
 * Rate Limiting (In-Memory - Use Redis in production)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, limit: number = 100, windowMs: number = 900000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  record.count++
  return { success: true, remaining: limit - record.count }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate CSRF token (example - use library in production)
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Get client IP address from request
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}
