# Property Alerts Consent System

## Overview

The property alerts feature requires explicit user consent before users can create alerts or receive notifications. This ensures compliance with privacy regulations and gives users full control over their notification preferences.

## User Flow

### First-Time Alert Creation

1. **User navigates to `/alerts` page**
   - System checks if user has given consent (`alertsConsent = false`)
   - Displays banner explaining alerts feature
   - "Create Alert" button is disabled

2. **User clicks "Enable Alerts Now"**
   - Modal appears explaining what alerts are
   - Shows benefits (real-time notifications, location-based alerts, etc.)
   - Includes privacy note
   - Two options: "Not Now" or "Enable Alerts"

3. **User accepts consent**
   - `alertsConsent` set to `true`
   - `alertsConsentDate` set to current timestamp
   - User can now create alerts
   - Confirmation message displayed

4. **User declines consent**
   - Modal closes
   - Redirected to properties page
   - Can return and accept consent later

### Managing Consent

Users can manage alert consent from their profile page at `/profile`:

- **View consent status**: See if alerts are enabled/disabled
- **Toggle consent**: Enable or disable alerts anytime
- **See consent date**: When consent was originally given
- **Link to alerts**: Direct link to manage saved alerts

When disabling alerts:
- Confirmation dialog asks if user is sure
- Existing alerts remain but won't send notifications
- User must re-enable to receive notifications again

## Technical Implementation

### Database Schema

```prisma
model User {
  // ... other fields
  alertsConsent     Boolean   @default(false) @map("alerts_consent")
  alertsConsentDate DateTime? @map("alerts_consent_date")
  // ... relations
}
```

### API Endpoints

#### GET /api/profile
Returns user profile including consent status:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "alertsConsent": true,
    "alertsConsentDate": "2026-01-22T08:36:34.000Z",
    ...
  }
}
```

#### PATCH /api/profile
Update consent status:
```json
{
  "alertsConsent": true
}
```

Response updates `alertsConsentDate` to current time when enabling.

#### POST /api/alerts
Creating alerts requires consent:
- Checks `user.alertsConsent` before allowing creation
- Returns 403 error if consent not given
- Error message: "You must enable alerts in your settings before creating alerts"

### UI Components

#### AlertConsentModal
Location: `/src/components/AlertConsentModal.tsx`

Props:
- `onAccept: () => void` - Called when user accepts
- `onDecline: () => void` - Called when user declines
- `isLoading?: boolean` - Shows loading state during API call

Features:
- Clean, professional design
- Clear explanation of benefits
- Privacy notice
- Icon-based visual hierarchy
- Accessible button states

#### Alerts Page Banner
Location: `/src/app/alerts/page.tsx`

When user hasn't given consent:
- Displays blue informational banner
- Explains need for consent
- "Enable Alerts Now" button
- "Create Alert" button disabled

#### Profile Settings
Location: `/src/app/profile/page.tsx`

Dedicated "Property Alerts" section:
- Current consent status (Enabled/Disabled badge)
- Description of alerts feature
- Enable/Disable toggle button
- Consent date display
- Link to manage alerts (when enabled)
- Confirmation dialog when disabling

## Security & Privacy

### Consent Requirements
- Users must explicitly opt-in
- Consent is recorded with timestamp
- Can be revoked at any time
- Existing alerts don't send notifications when consent is disabled

### Data Protection
- No alerts created without consent
- API validates consent before processing
- Clear privacy notice in consent modal
- Users control notification preferences per alert

### Audit Trail
- `alertsConsentDate` records when consent was given
- Can track consent history if needed
- Supports GDPR/privacy compliance

## User Experience

### Benefits of This Approach

1. **Transparency**: Users know exactly what they're signing up for
2. **Control**: Easy to enable/disable at any time
3. **Context**: Consent requested when user shows intent (trying to create alert)
4. **Compliance**: Meets privacy regulations
5. **Trust**: Professional, user-friendly consent flow

### Best Practices Implemented

- ✅ Consent requested in context (not on login)
- ✅ Clear explanation of what users receive
- ✅ Easy to decline without punishment
- ✅ Easy to revoke consent later
- ✅ Visual feedback (badges, status indicators)
- ✅ Privacy notice included
- ✅ Confirmation for destructive actions (disabling)

## Testing Checklist

### New User Flow
- [ ] Navigate to /alerts without consent
- [ ] See banner explaining need for consent
- [ ] Create Alert button is disabled
- [ ] Click "Enable Alerts Now"
- [ ] See consent modal
- [ ] Click "Not Now" - redirected to /properties
- [ ] Return to /alerts
- [ ] Click "Enable Alerts Now" again
- [ ] Click "Enable Alerts"
- [ ] See success message
- [ ] Create Alert button now enabled
- [ ] Can create alerts successfully

### Profile Management
- [ ] Navigate to /profile
- [ ] See "Property Alerts" section
- [ ] Status shows "Enabled" badge
- [ ] Consent date displayed
- [ ] Click "Disable"
- [ ] See confirmation dialog
- [ ] Confirm disable
- [ ] Status updates to disabled
- [ ] No badge shown
- [ ] Click "Enable"
- [ ] Status updates immediately
- [ ] Link to "Manage your alerts" appears when enabled

### API Security
- [ ] Try POST /api/alerts without consent → 403 error
- [ ] Enable consent via API
- [ ] Try POST /api/alerts with consent → Success
- [ ] Disable consent
- [ ] Try POST /api/alerts → 403 error again

### Edge Cases
- [ ] Consent persists across sessions
- [ ] Consent status cached appropriately (10min)
- [ ] Existing alerts remain after disabling consent
- [ ] Alerts don't send notifications when consent disabled
- [ ] Re-enabling consent doesn't create duplicate consents

## Migration Notes

For existing users:
- `alertsConsent` defaults to `false` for all existing users
- Existing `PropertyAlert` records remain valid
- Users must opt-in to continue receiving notifications
- Communication plan recommended to inform existing users

## Future Enhancements

- [ ] Email notification when consent status changes
- [ ] Granular consent (email vs in-app notifications)
- [ ] Consent history tracking
- [ ] Admin dashboard for consent analytics
- [ ] Consent renewal reminders (annual/biannual)
- [ ] Export consent records for compliance

## Related Files

- `/prisma/schema.prisma` - User model with consent fields
- `/prisma/migrations/20260122083634_add_alerts_consent/` - Migration
- `/src/components/AlertConsentModal.tsx` - Consent modal component
- `/src/app/alerts/page.tsx` - Alerts page with consent checking
- `/src/app/profile/page.tsx` - Profile page with consent management
- `/src/app/api/alerts/route.ts` - API with consent validation
- `/src/app/api/profile/route.ts` - API for consent management

## Support

Common user questions:

**Q: Why do I need to enable alerts?**
A: We respect your privacy and want you to have full control over notifications you receive.

**Q: Can I disable alerts later?**
A: Yes, you can disable alerts anytime from your profile settings.

**Q: What happens to my saved alerts if I disable this?**
A: Your alerts remain saved but won't send notifications until you re-enable the feature.

**Q: Will I get spam?**
A: No, you only receive notifications for properties matching your explicit search criteria.

**Q: Is my information shared?**
A: No, your alert preferences are private and never shared.
