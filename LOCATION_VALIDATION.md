# Location Validation Feature - Implementation Guide

## Overview

This document describes the implementation of validated location data for property listings using Google Places API. This ensures all location information is accurate and consistent across the platform.

## Problem Solved

**Before**: Users could manually enter location information, leading to:
- Typos and misspellings
- Inconsistent formatting (e.g., "SF" vs "San Francisco")
- Invalid addresses
- Incorrect city/area associations
- Poor search experience

**After**: Users select addresses from Google Places autocomplete, which:
- Validates all addresses against Google's database
- Extracts structured data (street, city, state, country, postal code)
- Provides GPS coordinates (latitude/longitude) for mapping
- Ensures consistent, searchable location data
- Improves user experience with autocomplete suggestions

## Architecture

### Components

#### 1. LocationAutocomplete Component (`/src/components/LocationAutocomplete.tsx`)

A reusable React component that wraps Google Places Autocomplete API.

**Features:**
- Loads Google Maps JavaScript API dynamically
- Provides autocomplete suggestions as user types
- Extracts structured address components
- Returns formatted location data

**Usage:**
```tsx
<LocationAutocomplete
  onLocationSelect={handleLocationSelect}
  defaultValue="Initial value"
  placeholder="Start typing an address..."
  required
  label="Property Location"
/>
```

**Callback Data Structure:**
```typescript
{
  address: string        // Street address
  city: string          // City name
  state: string         // State/Province code
  country: string       // Country name
  postalCode: string    // Postal/ZIP code
  latitude: number      // GPS latitude
  longitude: number     // GPS longitude
  formattedAddress: string  // Complete formatted address
}
```

### Database Schema

#### Updated Property Model

Added new fields to the `properties` table:

```prisma
model Property {
  // ... existing fields ...
  
  location      String         // City or primary location (for search)
  address       String?        // Street address
  city          String?        // City name
  state         String?        // State/Province
  country       String?        // Country
  postalCode    String?        // Postal/ZIP code
  latitude      Decimal?       // GPS latitude
  longitude     Decimal?       // GPS longitude
  
  // ... other fields ...
}
```

**Migration**: `20260121075354_add_structured_location_fields`

### Form Integration

#### Property Creation Form (`/src/app/owner/properties/new/page.tsx`)

**State Management:**
```typescript
const [formData, setFormData] = useState({
  // ... other fields ...
  location: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
})
```

**Location Handler:**
```typescript
const handleLocationSelect = (locationData: any) => {
  setFormData({
    ...formData,
    location: locationData.city || locationData.formattedAddress,
    address: locationData.address,
    city: locationData.city,
    state: locationData.state,
    country: locationData.country,
    postalCode: locationData.postalCode,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
  })
}
```

**Visual Feedback:**
Displays a summary box showing all extracted location components after selection.

#### Property Edit Form (`/src/app/owner/properties/[id]/edit/page.tsx`)

Same integration as creation form, but with pre-populated values from existing property data.

### Validation Schema

Updated Zod validation schema in `/src/lib/validations.ts`:

```typescript
export const propertySchema = z.object({
  // ... existing fields ...
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  // ... other fields ...
})
```

## Setup Instructions

### 1. Install Dependencies

No additional npm packages required - uses Google Maps JavaScript API via script tag.

### 2. Get Google Maps API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable these APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API
4. Create credentials → API Key
5. (Optional) Restrict the key to your domain
6. (Optional) Restrict to only the above APIs

### 3. Configure Environment Variable

Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-api-key-here"
```

**Important**: The `NEXT_PUBLIC_` prefix is required for client-side access.

### 4. Run Database Migration

```bash
npx prisma migrate dev --name add_structured_location_fields
npx prisma generate
```

## Usage Guide

### For Property Owners

1. **Creating a Property**:
   - Navigate to "Add New Property"
   - Start typing an address in the "Property Location" field
   - Select the correct address from the autocomplete dropdown
   - The system automatically extracts and displays:
     - Street address
     - City
     - State/Province
     - Country
     - Postal code
   - Continue filling out the rest of the form

2. **Editing a Property**:
   - The current location is pre-filled
   - To change, start typing a new address
   - Select from autocomplete suggestions
   - Location data updates automatically

### For Developers

#### Integrating LocationAutocomplete

```tsx
import LocationAutocomplete from '@/components/LocationAutocomplete'

function MyForm() {
  const [location, setLocation] = useState(null)
  
  const handleLocationSelect = (locationData) => {
    setLocation(locationData)
    // locationData contains all structured fields
  }
  
  return (
    <LocationAutocomplete
      onLocationSelect={handleLocationSelect}
      placeholder="Enter address"
      required={true}
    />
  )
}
```

#### Accessing Location Data

The callback provides:
- `formattedAddress`: Full address string
- `address`: Street address only
- `city`: City name
- `state`: State/province code
- `country`: Country name
- `postalCode`: ZIP/postal code
- `latitude`: GPS latitude
- `longitude`: GPS longitude

Use these fields for:
- Display formatting
- Search and filtering
- Map integration
- Geographic analysis

## API Integration

### Property Creation Endpoint

```typescript
// POST /api/properties
{
  "title": "...",
  "location": "San Francisco",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "country": "United States",
  "postalCode": "94102",
  "latitude": 37.7749,
  "longitude": -122.4194,
  // ... other fields
}
```

### Property Update Endpoint

```typescript
// PATCH /api/properties/[id]
{
  "location": "San Francisco",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "country": "United States",
  "postalCode": "94102",
  "latitude": 37.7749,
  "longitude": -122.4194,
  // ... other fields
}
```

## Benefits

### For Users
- ✅ Faster property listing creation with autocomplete
- ✅ No typos or formatting errors
- ✅ Confidence that address is valid
- ✅ Better search experience

### For Platform
- ✅ Consistent, clean location data
- ✅ Accurate geographic coordinates
- ✅ Better search and filtering capabilities
- ✅ Potential for map features
- ✅ Analytics by location possible
- ✅ No duplicate locations due to typos

### For Search & Discovery
- ✅ Reliable city-based filtering
- ✅ State/region searches work correctly
- ✅ Can implement proximity search (using lat/long)
- ✅ Popular locations feature works better

## Future Enhancements

### Potential Features

1. **Map View**: Display properties on an interactive map using coordinates
2. **Proximity Search**: "Properties within X miles of location"
3. **Neighborhood Data**: Integrate neighborhood information
4. **Transit Scores**: Show walkability and transit scores
5. **Distance Calculator**: Calculate distance to landmarks/points of interest
6. **Autocomplete in Search**: Add location autocomplete to search filters

### Technical Improvements

1. **Geocoding Fallback**: Implement fallback geocoding service
2. **Offline Support**: Cache common addresses
3. **Address Standardization**: Normalize address formats
4. **Duplicate Detection**: Detect duplicate properties at same location
5. **Reverse Geocoding**: Convert coordinates back to addresses

## Troubleshooting

### API Key Not Working

**Problem**: Location autocomplete not appearing
**Solutions**:
- Verify API key in `.env.local`
- Check that APIs are enabled in Google Cloud Console
- Ensure `NEXT_PUBLIC_` prefix is used
- Restart development server after adding key
- Check browser console for error messages

### No Autocomplete Suggestions

**Problem**: Component renders but no suggestions appear
**Solutions**:
- Check API key restrictions (domain/API restrictions)
- Verify Places API is enabled
- Check browser network tab for API requests
- Ensure you have billing enabled on Google Cloud

### Incorrect Location Data

**Problem**: Component returns wrong city or incomplete data
**Solutions**:
- This is usually due to Google's address parsing
- User should select a more specific address
- Consider adding manual override options for edge cases

### Migration Errors

**Problem**: Prisma migration fails
**Solutions**:
- Ensure database is running
- Check DATABASE_URL is correct
- Run `npx prisma generate` after migration
- Clear existing migrations if needed (development only)

## Cost Considerations

### Google Maps API Pricing

- **Places Autocomplete**: $2.83 per 1,000 requests
- **Geocoding API**: $5.00 per 1,000 requests
- **Free Tier**: $200 monthly credit (covers ~70,000 requests)

### Optimization Tips

1. **Debounce Input**: Wait for user to stop typing (300ms)
2. **Cache Results**: Store recently searched addresses
3. **Limit Requests**: Minimum 3 characters before search
4. **Session Tokens**: Use session tokens for autocomplete
5. **Restrict Results**: Limit to specific country/region

### Example Implementation

```typescript
// Add debouncing to LocationAutocomplete
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Use in component
const debouncedSearch = debounce(performSearch, 300)
```

## Security Considerations

1. **API Key Restrictions**:
   - Restrict to your domain(s) in production
   - Restrict to only needed APIs
   - Monitor usage in Google Cloud Console

2. **Input Validation**:
   - Always validate location data server-side
   - Don't trust client-provided coordinates
   - Verify addresses match expected format

3. **Data Privacy**:
   - Don't store full addresses if not needed
   - Consider privacy when displaying locations
   - Follow GDPR guidelines for location data

## Testing

### Manual Testing Checklist

- [ ] Autocomplete appears when typing
- [ ] Selecting address populates all fields
- [ ] Location summary box displays correctly
- [ ] Form submits with location data
- [ ] Edit form pre-populates location
- [ ] Invalid API key shows error message
- [ ] Works on mobile devices
- [ ] International addresses work
- [ ] P.O. Box addresses handled appropriately

### Automated Testing

Consider adding tests for:
- Component rendering
- Location selection callback
- Form state updates
- API error handling
- Data validation

## Support

For issues or questions:
1. Check Google Cloud Console logs
2. Review browser console for errors
3. Verify environment variables
4. Test API key with Google's test tool
5. Check Prisma migration status

## Changelog

### Version 1.0.0 (January 21, 2026)

**Added**:
- LocationAutocomplete component
- Structured location fields in database
- Google Places API integration
- Location validation in forms
- Migration for location fields
- Documentation and setup guide

**Changed**:
- Property creation form UI
- Property edit form UI
- Validation schema
- API endpoints to handle new fields

**Deprecated**:
- Manual location text input (replaced with autocomplete)

## Conclusion

The location validation feature significantly improves data quality and user experience. By leveraging Google Places API, we ensure consistent, accurate location data that enables better search, filtering, and future mapping features.
