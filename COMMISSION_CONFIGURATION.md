# Commission Rate Configuration

## Overview
The wallet credit commission rate (cash back percentage for property listings) is now **fully configurable** by super admins through the admin settings interface, rather than being hardcoded.

## How It Works

### 1. Database Storage
- Commission rate is stored in the `system_settings` table
- Key: `owner_credit_rate`
- Value: Percentage (e.g., "10.0" for 10%)
- Default: 10% (automatically created if doesn't exist)

### 2. Super Admin Interface
Navigate to `/admin/settings` to configure:
- **Input**: Owner Credit Rate (%)
- **Range**: 0-100%
- **Changes**: Applied immediately to all new approvals

### 3. Where It's Used

#### Backend (Wallet Crediting)
- `src/app/api/admin/properties/[id]/route.ts` - Admin property approval
- `src/app/api/properties/route.ts` - Property creation with payment
- Both endpoints fetch the rate from `system_settings` before calculating credits

#### Frontend (Display)
- `src/app/page.tsx` - Homepage displays current rate dynamically
- `src/app/api/settings/credit-rate/route.ts` - Public API endpoint for fetching rate
- Homepage fetches rate on load and displays it in:
  - Hero badge: "List Your Property & Get X% Cash Back"
  - Features section
  - Cash back banner

## API Endpoints

### Get Credit Rate (Public)
```
GET /api/settings/credit-rate
Response: { success: true, creditRate: 10.0 }
```

### Update Credit Rate (Super Admin Only)
```
PUT /api/admin/settings
Body: { key: "owner_credit_rate", value: "15.0" }
Response: { success: true, setting: {...} }
```

## Example Usage

### Changing Commission Rate
1. Login as super admin
2. Navigate to `/admin/settings`
3. Update "Owner Credit Rate (%)" field
4. Click "Save Changes"
5. New rate applies immediately to:
   - All new property approvals
   - Homepage display
   - Future wallet credits

### Rate Calculation
```typescript
// Example: R49 listing with 10% rate
const listingPrice = 49.00
const creditRate = 10.0 // from settings
const creditAmount = listingPrice * (creditRate / 100)
// creditAmount = R4.90 credited to wallet
```

## Benefits
✅ No code changes needed to adjust commission  
✅ Real-time updates on homepage  
✅ Centralized configuration  
✅ Audit trail in system_settings table  
✅ Default fallback if setting not found  

## Notes
- Changes are **immediate** - no restart required
- Homepage updates on next page load
- Existing credited amounts are not retroactively changed
- Rate is percentage of listing price (e.g., 10% of R49 = R4.90)
