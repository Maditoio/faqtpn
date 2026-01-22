# Property Alerts Feature

## Overview

The Property Alerts system allows users to create custom searches and receive notifications when new properties matching their criteria are listed on the platform.

## Features

### For Users

1. **Create Custom Alerts**
   - Define search criteria (location, property type, price range, bedrooms, bathrooms)
   - Name alerts for easy management
   - Choose notification preferences (in-app, email)

2. **Alert Management**
   - View all saved alerts
   - Edit existing alerts
   - Pause/activate alerts
   - Delete alerts
   - See match count and last triggered date

3. **Smart Notifications**
   - Real-time in-app notifications when new properties match
   - Email notifications (when enabled)
   - Notifications linked directly to matching properties

### Alert Matching Criteria

Alerts support the following filters:
- **Location**: City or area (case-insensitive, partial match)
- **Property Type**: Apartment, House, Townhouse, Cottage, etc.
- **Price Range**: Minimum and maximum price
- **Bedrooms**: Minimum number of bedrooms
- **Bathrooms**: Minimum number of bathrooms

## Database Schema

```prisma
model PropertyAlert {
  id                String       @id @default(uuid())
  userId            String       
  name              String       
  location          String?      
  propertyType      PropertyType?
  minPrice          Decimal?     
  maxPrice          Decimal?     
  minBedrooms       Int?
  minBathrooms      Int?
  isActive          Boolean      @default(true)
  notifyEmail       Boolean      @default(true)
  notifyInApp       Boolean      @default(true)
  lastTriggered     DateTime?    
  matchCount        Int          @default(0)
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  user              User         @relation(...)
}
```

## API Endpoints

### GET /api/alerts
Get all alerts for the current user.

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "name": "2-bed apartments in Sandton",
      "location": "Sandton",
      "propertyType": "APARTMENT",
      "minBedrooms": 2,
      "isActive": true,
      "matchCount": 5,
      "createdAt": "2026-01-22T08:00:00Z"
    }
  ]
}
```

### POST /api/alerts
Create a new alert.

**Request Body:**
```json
{
  "name": "2-bed apartments in Sandton",
  "location": "Sandton",
  "propertyType": "APARTMENT",
  "minPrice": 5000,
  "maxPrice": 15000,
  "minBedrooms": 2,
  "notifyEmail": true,
  "notifyInApp": true
}
```

### PATCH /api/alerts/[id]
Update an existing alert.

### DELETE /api/alerts/[id]
Delete an alert.

## Alert Matching Logic

When a property is approved by an admin:

1. **Fetch Active Alerts**: Get all active alerts from the database
2. **Match Criteria**: For each alert, check if the property matches:
   - Location contains the alert location (case-insensitive)
   - Property type matches (if specified)
   - Price falls within min/max range (if specified)
   - Bedrooms >= minimum (if specified)
   - Bathrooms >= minimum (if specified)
3. **Send Notifications**: For matching alerts:
   - Create in-app notification (if enabled)
   - Send email (if enabled - TODO)
   - Update alert metadata (lastTriggered, matchCount)

## Implementation Files

### Backend
- `/src/app/api/alerts/route.ts` - List and create alerts
- `/src/app/api/alerts/[id]/route.ts` - Update and delete alerts
- `/src/lib/alert-matcher.ts` - Alert matching logic
- `/src/app/api/admin/properties/[id]/route.ts` - Integration with property approval

### Frontend
- `/src/app/alerts/page.tsx` - Alerts management UI
- `/src/components/layout/Navbar.tsx` - Navigation (Alerts link)

### Database
- `/prisma/schema.prisma` - PropertyAlert model
- `/prisma/migrations/20260122082304_add_property_alerts/` - Migration

## Usage Examples

### Creating an Alert

Users can create alerts from `/alerts` page:

1. Click "Create Alert"
2. Fill in criteria:
   - Name: "Family homes in Pretoria"
   - Location: "Pretoria"
   - Property Type: "House"
   - Min Bedrooms: 3
   - Max Price: R25,000
3. Choose notification preferences
4. Submit

### Receiving Notifications

When a new property matching the alert is approved:

1. User receives in-app notification
2. Notification appears in notification bell
3. Clicking notification takes user to property details
4. Alert's match count is incremented

## Future Enhancements

- [ ] Email notification integration
- [ ] Weekly digest of matching properties
- [ ] Alert templates for common searches
- [ ] Advanced filters (amenities, parking, etc.)
- [ ] Alert sharing between users
- [ ] SMS notifications
- [ ] Alert performance analytics
- [ ] Suggested alerts based on user activity

## Testing

### Manual Testing Checklist

- [ ] Create a new alert
- [ ] Edit existing alert
- [ ] Delete alert
- [ ] Pause/activate alert
- [ ] Create property that matches alert (as admin)
- [ ] Verify notification is sent
- [ ] Check match count increases
- [ ] Test various filter combinations
- [ ] Test mobile responsiveness

### Example Test Scenario

1. **Setup**: User creates alert for "2+ bed apartments in Johannesburg, R10k-R15k"
2. **Action**: Admin approves property: 2-bed apartment in Johannesburg @ R12,000
3. **Expected**: 
   - User receives notification
   - Alert match count = 1
   - lastTriggered is updated
   - Notification links to property

## Performance Considerations

- Alerts are checked only when properties are approved (not on every property creation)
- Database queries use indexes on location, propertyType, and isActive
- Alert matching runs asynchronously to not block property approval
- Notifications are batched for efficiency

## Security

- Users can only view/edit/delete their own alerts
- Alert criteria is validated server-side
- No sensitive data exposed in notifications
- Rate limiting on alert creation (max 10 per user recommended - TODO)

## Monitoring

Key metrics to track:
- Number of active alerts per user
- Alert match rate
- Notification open rate
- Alert retention rate
- Popular search criteria

## Support

For issues or questions:
- Check notification permissions in profile settings
- Verify alert is active
- Check email settings if not receiving emails
- Review property criteria - alerts only match approved properties
