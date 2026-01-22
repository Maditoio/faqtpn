import prisma from '@/lib/prisma'

interface Property {
  id: string
  title: string
  location: string | null
  city: string | null
  state: string | null
  address: string | null
  propertyType: string | null
  price: any
  bedrooms: number | null
  bathrooms: number | null
}

/**
 * Check if a property matches alert criteria
 */
function propertyMatchesAlert(property: Property, alert: any): boolean {
  // Location match (case-insensitive, partial match)
  // Check city, state, location, and address fields
  if (alert.location) {
    const alertLocation = alert.location.toLowerCase().trim()
    const propertyLocations = [
      property.city,
      property.state,
      property.location,
      property.address,
    ]
      .filter(Boolean) // Remove null/undefined
      .map(loc => loc?.toLowerCase().trim())
    
    // Property matches if ANY location field contains the alert location
    const hasMatch = propertyLocations.some(loc => 
      loc && loc.includes(alertLocation)
    )
    
    if (!hasMatch) {
      console.log(`❌ Location mismatch: Alert "${alert.location}" vs Property [${propertyLocations.join(', ')}]`)
      return false
    }
    console.log(`✅ Location match: "${alert.location}" found in [${propertyLocations.join(', ')}]`)
  }

  // Property type match
  if (alert.propertyType && alert.propertyType !== property.propertyType) {
    return false
  }

  // Price range
  if (property.price) {
    const price = Number(property.price)
    if (alert.minPrice && price < Number(alert.minPrice)) {
      return false
    }
    if (alert.maxPrice && price > Number(alert.maxPrice)) {
      return false
    }
  }

  // Bedrooms
  if (alert.minBedrooms && (!property.bedrooms || property.bedrooms < alert.minBedrooms)) {
    return false
  }

  // Bathrooms
  if (alert.minBathrooms && (!property.bathrooms || property.bathrooms < alert.minBathrooms)) {
    return false
  }

  return true
}

/**
 * Send notifications to users whose alerts match the new property
 */
export async function notifyMatchingAlerts(property: Property) {
  try {
    console.log(`\n🔍 Checking alerts for property: ${property.title}`)
    console.log(`   Location fields: city="${property.city}", state="${property.state}", location="${property.location}", address="${property.address}"`)
    
    // Get all active alerts
    const alerts = await prisma.propertyAlert.findMany({
      where: {
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    console.log(`   Found ${alerts.length} active alerts to check`)

    const notifications: Promise<any>[] = []
    const alertUpdates: Promise<any>[] = []

    for (const alert of alerts) {
      console.log(`\n   Checking alert: "${alert.name}" (user: ${alert.user.name})`)
      console.log(`     Alert location: "${alert.location || 'any'}"`)
      console.log(`     Alert type: ${alert.propertyType || 'any'}`)
      console.log(`     Alert price: ${alert.minPrice || 0} - ${alert.maxPrice || 'unlimited'}`)
      console.log(`     Alert bedrooms: ${alert.minBedrooms || 'any'}+`)
      
      // Check if property matches this alert
      if (propertyMatchesAlert(property, alert)) {
        console.log(`     ✅ MATCH! Sending notification...`)
        
        // Create in-app notification if enabled
        if (alert.notifyInApp) {
          notifications.push(
            prisma.notification.create({
              data: {
                userId: alert.userId,
                title: '🔔 New Property Alert!',
                message: `A new property "${property.title}" matching your alert "${alert.name}" is now available!`,
                type: 'ALERT_MATCH',
                propertyId: property.id,
              },
            })
          )
        }

        // Update alert metadata
        alertUpdates.push(
          prisma.propertyAlert.update({
            where: { id: alert.id },
            data: {
              lastTriggered: new Date(),
              matchCount: { increment: 1 },
            },
          })
        )

        // TODO: Send email notification if alert.notifyEmail is true
        // Send email notification if enabled
        if (alert.notifyEmail && alert.user.email) {
        const { sendAlertEmail } = await import('@/lib/email')
        await sendAlertEmail({
            to: alert.user.email,
            userName: alert.user.name,
            propertyTitle: property.title,
            propertyLocation: property.city || property.location || 'Unknown location',
            propertyPrice: `R${Number(property.price).toLocaleString()}`,
            propertyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/properties/${property.id}`,
            alertName: alert.name,
        })
        }
        // This would require email service integration
      } else {
        console.log(`     ❌ No match`)
      }
    }

    // Execute all notifications and updates
    if (notifications.length > 0) {
      await Promise.all([...notifications, ...alertUpdates])
      console.log(`\n✅ Sent ${notifications.length} alert notifications for property ${property.id}`)
    } else {
      console.log(`\n❌ No matching alerts found for property ${property.id}`)
    }

    return notifications.length
  } catch (error) {
    console.error('Error notifying matching alerts:', error)
    return 0
  }
}

/**
 * Get count of properties matching an alert
 */
export async function getAlertMatchCount(alertId: string): Promise<number> {
  try {
    const alert = await prisma.propertyAlert.findUnique({
      where: { id: alertId },
    })

    if (!alert) {
      return 0
    }

    // Build where clause based on alert criteria
    const where: any = {
      status: 'APPROVED', // Only count approved properties
    }

    if (alert.location) {
      // Search across all location fields
      where.OR = [
        { city: { contains: alert.location, mode: 'insensitive' } },
        { state: { contains: alert.location, mode: 'insensitive' } },
        { location: { contains: alert.location, mode: 'insensitive' } },
        { address: { contains: alert.location, mode: 'insensitive' } },
      ]
    }

    if (alert.propertyType) {
      where.propertyType = alert.propertyType
    }

    if (alert.minPrice || alert.maxPrice) {
      where.price = {}
      if (alert.minPrice) where.price.gte = alert.minPrice
      if (alert.maxPrice) where.price.lte = alert.maxPrice
    }

    if (alert.minBedrooms) {
      where.bedrooms = { gte: alert.minBedrooms }
    }

    if (alert.minBathrooms) {
      where.bathrooms = { gte: alert.minBathrooms }
    }

    const count = await prisma.property.count({ where })

    return count
  } catch (error) {
    console.error('Error getting alert match count:', error)
    return 0
  }
}
