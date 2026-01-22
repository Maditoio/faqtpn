import NodeCache from 'node-cache'

/**
 * In-memory cache configuration
 * 
 * Cache TTLs (Time To Live) in seconds:
 * - Properties list: 5 minutes (frequently updated, user-facing)
 * - Property details: 10 minutes (less frequently changed)
 * - User profile: 15 minutes (rarely changes)
 * - Analytics/Stats: 30 minutes (heavy queries, less critical freshness)
 * - Locations/Lookups: 1 hour (rarely changes)
 */

class CacheManager {
  private cache: NodeCache
  private enabled: boolean

  constructor() {
    // Disable caching in development for easier debugging, or set ENABLE_CACHE=true
    this.enabled = process.env.NODE_ENV === 'production' || process.env.ENABLE_CACHE === 'true'
    
    this.cache = new NodeCache({
      stdTTL: 600, // Default TTL: 10 minutes
      checkperiod: 120, // Check for expired keys every 2 minutes
      useClones: false, // Don't clone objects (better performance)
      deleteOnExpire: true,
    })

    // Log cache statistics periodically in production
    if (this.enabled && process.env.NODE_ENV === 'production') {
      setInterval(() => {
        const stats = this.cache.getStats()
        console.log('[Cache Stats]', {
          keys: stats.keys,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0,
        })
      }, 300000) // Every 5 minutes
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined
    
    try {
      return this.cache.get<T>(key)
    } catch (error) {
      console.error('[Cache] Error getting key:', key, error)
      return undefined
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    if (!this.enabled) return false
    
    try {
      return this.cache.set(key, value, ttl || 0)
    } catch (error) {
      console.error('[Cache] Error setting key:', key, error)
      return false
    }
  }

  /**
   * Delete a specific key from cache
   */
  del(key: string | string[]): number {
    if (!this.enabled) return 0
    
    try {
      return this.cache.del(key)
    } catch (error) {
      console.error('[Cache] Error deleting key:', key, error)
      return 0
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  delPattern(pattern: string): number {
    if (!this.enabled) return 0
    
    try {
      const keys = this.cache.keys().filter(key => key.includes(pattern))
      if (keys.length > 0) {
        return this.cache.del(keys)
      }
      return 0
    } catch (error) {
      console.error('[Cache] Error deleting pattern:', pattern, error)
      return 0
    }
  }

  /**
   * Clear all cache
   */
  flush(): void {
    if (!this.enabled) return
    
    try {
      this.cache.flushAll()
      console.log('[Cache] Flushed all cache')
    } catch (error) {
      console.error('[Cache] Error flushing cache:', error)
    }
  }

  /**
   * Check if cache has a key
   */
  has(key: string): boolean {
    if (!this.enabled) return false
    return this.cache.has(key)
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return this.cache.getStats()
  }

  /**
   * Get or set pattern - fetch from cache or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key)
    if (cached !== undefined) {
      return cached
    }

    // Fetch fresh data
    const data = await fetchFn()
    
    // Store in cache
    this.set(key, data, ttl)
    
    return data
  }
}

// Singleton instance
const cacheManager = new CacheManager()

export default cacheManager

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  // Properties
  propertiesList: (filters: Record<string, any>) => 
    `properties:list:${JSON.stringify(filters)}`,
  propertyDetail: (id: string) => 
    `property:${id}`,
  propertyImages: (id: string) => 
    `property:${id}:images`,
  propertyFavorites: (id: string) => 
    `property:${id}:favorites`,
  
  // Owner
  ownerProperties: (ownerId: string) => 
    `owner:${ownerId}:properties`,
  ownerAnalytics: (ownerId: string) => 
    `owner:${ownerId}:analytics`,
  ownerDrafts: (ownerId: string) => 
    `owner:${ownerId}:drafts`,
  
  // User
  userProfile: (userId: string) => 
    `user:${userId}:profile`,
  userFavorites: (userId: string) => 
    `user:${userId}:favorites`,
  userNotifications: (userId: string) => 
    `user:${userId}:notifications`,
  
  // Stats and Analytics
  adminStats: () => 
    `admin:stats`,
  propertyStats: () => 
    `properties:stats`,
  propertyLocations: () => 
    `properties:locations`,
  
  // Lookups
  allUsers: () => 
    `admin:users`,
  propertyTypes: () => 
    `lookups:propertyTypes`,
}

/**
 * Cache TTLs in seconds
 */
export const CacheTTL = {
  SHORT: 300,      // 5 minutes - frequently changing data
  MEDIUM: 600,     // 10 minutes - standard cache
  LONG: 1800,      // 30 minutes - analytics, stats
  VERY_LONG: 3600, // 1 hour - lookups, rarely changing data
}

/**
 * Invalidation helpers - call these when data changes
 */
export const invalidateCache = {
  // Invalidate all property-related caches
  property: (propertyId: string) => {
    cacheManager.del(CacheKeys.propertyDetail(propertyId))
    cacheManager.del(CacheKeys.propertyImages(propertyId))
    cacheManager.del(CacheKeys.propertyFavorites(propertyId))
    cacheManager.delPattern('properties:list')
    cacheManager.delPattern('properties:stats')
    cacheManager.delPattern('properties:locations')
  },
  
  // Invalidate owner-specific caches
  owner: (ownerId: string) => {
    cacheManager.del(CacheKeys.ownerProperties(ownerId))
    cacheManager.del(CacheKeys.ownerAnalytics(ownerId))
    cacheManager.del(CacheKeys.ownerDrafts(ownerId))
  },
  
  // Invalidate user-specific caches
  user: (userId: string) => {
    cacheManager.del(CacheKeys.userProfile(userId))
    cacheManager.del(CacheKeys.userFavorites(userId))
    cacheManager.del(CacheKeys.userNotifications(userId))
  },
  
  // Invalidate admin stats
  adminStats: () => {
    cacheManager.del(CacheKeys.adminStats())
    cacheManager.delPattern('admin:')
  },
  
  // Invalidate all property lists
  propertyLists: () => {
    cacheManager.delPattern('properties:list')
  },
  
  // Invalidate everything (use sparingly)
  all: () => {
    cacheManager.flush()
  },
}
