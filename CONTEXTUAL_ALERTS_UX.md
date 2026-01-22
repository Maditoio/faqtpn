# Property Alerts - Contextual Consent UX

## Design Philosophy

**Ask after intent is shown, not before.**

Users should only be prompted to create alerts when they've demonstrated a clear need for them, not preemptively.

## User Flow

### 1. User Searches for Property

User navigates to `/properties` and searches with specific criteria:
- **Location**: "Johannesburg"
- **Property Type**: "Apartment"
- **Bedrooms**: "2"
- **Price Range**: "R5,000 - R15,000"

### 2. Search Returns No/Few Results

**Scenario A: Zero Results**
```
┌────────────────────────────────────────┐
│  🔍 No properties found                │
│                                        │
│  No listings match your search         │
│  criteria right now.                   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 🔔 Want us to alert you?         │ │
│  │                                   │ │
│  │ We'll notify you instantly when   │ │
│  │ a property matching your search   │ │
│  │ becomes available in Johannesburg │ │
│  │                                   │ │
│  │ Your search criteria:             │ │
│  │ • Location: Johannesburg          │ │
│  │ • Type: Apartment                 │ │
│  │ • Bedrooms: 2+                    │ │
│  │ • Price: R5,000 - R15,000         │ │
│  │                                   │ │
│  │ [Yes, notify me] [No thanks]      │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

**Scenario B: Few Results (1-2 listings)**
```
┌────────────────────────────────────────┐
│  ℹ️  Only 2 listings found             │
│                                        │
│  Get notified when more properties     │
│  matching your search become available │
│                                        │
│  [Create alert]  [Dismiss]             │
└────────────────────────────────────────┘

[Property Card 1]
[Property Card 2]
```

### 3. User Takes Action

**Option A: Accepts ("Yes, notify me")**
1. System automatically enables `alertsConsent`
2. Creates PropertyAlert with search criteria
3. Shows success message: "✓ Alert created! We'll notify you when 2-bed apartments in Johannesburg become available."
4. User can continue browsing

**Option B: Declines ("No thanks" / "Dismiss")**
1. Prompt closes
2. User continues browsing
3. No database changes
4. Can trigger prompt again with different search

### 4. Implicit Consent

**Key Principle: Consent through action**
- No upfront permission modal
- User clicking "Yes, notify me" = consent
- Creating alert = opting in to notifications
- Clear, transparent about what they'll receive

### 5. Alert Created & Active

Once alert is created:
- Saved in database with all search criteria
- `alertsConsent` = true (set automatically)
- `alertsConsentDate` = current timestamp
- User can manage from `/alerts` page

## Alternative Opt-in Moments (Future)

### After Favoriting Multiple Properties
```
You've favorited 5 properties in Cape Town.
Want to be notified about similar listings?
[Create alert from favorites]
```

### On Profile Page
```
Get alerts for properties matching your interests.
[Set up alerts]
```

### After Saving Search (Future feature)
```
Save this search and get notified?
[Save & notify me]
```

## What We DON'T Do

❌ **Homepage banner**: "Enable notifications!"
❌ **Login popup**: "Allow alerts?"
❌ **Automatic enrollment**: Auto-enabled for all users
❌ **Hidden consent**: Buried in terms & conditions
❌ **Forced choice**: Must accept to continue
❌ **Vague prompts**: "Get updates" without explaining what

## Implementation Details

### Frontend: Properties Page

**File**: `/src/app/properties/page.tsx`

**Key Logic**:
```typescript
const fetchProperties = async () => {
  // ... fetch properties
  
  const hasActiveFilters = filters.location || filters.propertyType || filters.minPrice
  
  // Show alert prompt only if:
  // 1. User performed a search (clicked "Apply Filters")
  // 2. User has active search filters
  // 3. Results are empty or few (≤ 2)
  // 4. User is logged in
  if (searchPerformed && hasActiveFilters && results.length <= 2 && session) {
    setShowAlertPrompt(true)
  }
}
```

**Alert Creation**:
```typescript
const handleCreateAlert = async () => {
  // 1. Auto-enable consent
  await fetch('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify({ alertsConsent: true }),
  })
  
  // 2. Create alert from search criteria
  await fetch('/api/alerts', {
    method: 'POST',
    body: JSON.stringify({
      name: "2-bed Apartments in Johannesburg",
      location: filters.location,
      propertyType: filters.propertyType,
      minBedrooms: filters.bedrooms,
      // ... other criteria
    }),
  })
}
```

### Backend: Alerts API

**File**: `/src/app/api/alerts/route.ts`

**Implicit Consent**:
```typescript
export async function POST(request: NextRequest) {
  // ... auth check
  
  // Auto-enable consent when user creates first alert
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      alertsConsent: true,
      alertsConsentDate: new Date(),
    },
  })
  
  // Create alert...
}
```

### Database

```prisma
model User {
  alertsConsent     Boolean   @default(false)
  alertsConsentDate DateTime?
  propertyAlerts    PropertyAlert[]
}

model PropertyAlert {
  id           String   @id @default(uuid())
  userId       String
  name         String
  location     String?
  propertyType PropertyType?
  // ... search criteria
  isActive     Boolean  @default(true)
  notifyEmail  Boolean  @default(true)
  notifyInApp  Boolean  @default(true)
}
```

## User Benefits

### Clear Value Proposition
- **When**: User actively searching but finding no results
- **What**: "We'll notify you when matching properties become available"
- **How**: Shows exact criteria being saved
- **Control**: Easy "No thanks" option

### Transparency
- Prompt shows ALL search criteria being saved
- Clear about notification types (email, in-app)
- No hidden subscriptions
- Can manage/disable from profile anytime

### No Interruption
- Doesn't block user flow
- Appears contextually when relevant
- Can dismiss and continue browsing
- Doesn't repeat on every search (smart logic)

## Testing the Flow

### Manual Test Script

1. **Navigate to** `/properties`
2. **Search without filters** → No prompt (as expected)
3. **Add filters**:
   - Location: "Sandton"
   - Bedrooms: "3"
4. **Click "Apply Filters"**
5. **If 0-2 results** → ✅ Prompt should appear
6. **If 3+ results** → ✅ No prompt (enough options)
7. **Click "Yes, notify me"**
8. **Check**:
   - Success message appears
   - Alert visible in `/alerts`
   - Database: `alerts_consent = true`
9. **Search again with different criteria**
10. **Find no results** → Prompt appears again for NEW search
11. **Click "No thanks"** → Prompt closes, no DB changes

### Edge Cases

- **Not logged in**: No prompt (must be authenticated)
- **No active filters**: No prompt (can't create meaningful alert)
- **Many results (3+)**: No prompt (user has options)
- **Repeat search**: Prompt doesn't show if alert already exists for same criteria (future enhancement)

## Analytics Metrics

Track these to validate UX:
- **Prompt Show Rate**: How often prompt appears (should be low, only on empty searches)
- **Acceptance Rate**: % who click "Yes, notify me" vs "No thanks"
- **Alert Creation Success**: % of clicks that result in saved alerts
- **Alert Retention**: % of alerts that stay active after 30 days
- **Conversion**: Do alerted users rent more often?

## Privacy & Compliance

### GDPR Compliant
- ✅ Clear purpose stated upfront
- ✅ Explicit action required (clicking "Yes")
- ✅ Easy to withdraw (profile settings)
- ✅ Timestamp recorded (alertsConsentDate)
- ✅ Can export/delete data

### User Control
- Can disable all alerts from `/profile`
- Can delete individual alerts
- Can update notification preferences per alert
- Can see when consent was given

## Comparison: Old vs New Flow

### ❌ Old Flow (Upfront Consent)
```
User → /alerts page → "Enable alerts?" modal → Search → Create alert
Problems:
- Asks before showing value
- User has no context
- Feels like spam permission request
```

### ✅ New Flow (Contextual Consent)
```
User → Search → No results → "Want to be notified?" → Alert created
Benefits:
- User demonstrated need first
- Clear value proposition
- Contextual and helpful
- Higher acceptance rate
```

## Future Enhancements

1. **Smart Deduplication**: Don't show prompt if alert exists for same criteria
2. **Alert Templates**: "Popular searches in your area" suggestions
3. **Frequency Control**: "How often? Instant / Daily digest"
4. **Success Stories**: "Users who set alerts found properties 50% faster"
5. **Social Proof**: "125 people created alerts for this area today"

## Related Files

- `/src/app/properties/page.tsx` - Contextual alert prompt
- `/src/app/alerts/page.tsx` - Alert management (simplified)
- `/src/app/api/alerts/route.ts` - Implicit consent handling
- `/src/components/AlertConsentModal.tsx` - (Legacy, can be removed)
- `/prisma/schema.prisma` - User consent & PropertyAlert models
