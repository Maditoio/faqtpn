import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { UserRole } from '@prisma/client'

/**
 * Get the current authenticated user's session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Check if user is authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

/**
 * Check if user has required role(s)
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()
  
  if (!hasRole(user.role, allowedRoles)) {
    throw new Error('Forbidden')
  }
  
  return user
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  return requireRole(['SUPER_ADMIN'])
}

/**
 * Check if user is home owner or admin
 */
export async function requireOwnerOrAdmin() {
  return requireRole(['HOME_OWNER', 'SUPER_ADMIN'])
}
