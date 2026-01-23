# 📸 Photo Upload Limits - Quick Guide

## How It Works

### For Basic Plan (3 Photos)
```
Photos Uploaded: ██████░░░░ 2/3
Status: ✅ Can upload 1 more photo for free
```

```
Photos Uploaded: ██████████ 3/3
Status: ⚠️  Limit reached! 
Action: Click "Purchase extra slots for R5 each"
```

### After Purchase
```
Purchased: 2 extra slots for R10
New Limit: ████████████░░ 3/5
Status: ✅ Can upload 2 more photos
```

## Purchase Modal Flow

```
┌─────────────────────────────────────┐
│  Purchase Extra Photo Slots         │
├─────────────────────────────────────┤
│  Current plan limit: 3 photos       │
│  Photos uploaded: 3 photos          │
│  Your wallet balance: R45.00        │
├─────────────────────────────────────┤
│  Number of extra photos:            │
│    [ - ]    [ 2 ]    [ + ]         │
│    R5 per extra photo               │
├─────────────────────────────────────┤
│  Total cost: R10.00                 │
│  New total limit: 5 photos          │
├─────────────────────────────────────┤
│  [Cancel]  [Purchase for R10] ✓     │
└─────────────────────────────────────┘
```

## Implementation Summary

### ✅ What's Been Implemented

1. **Photo Limit Detection**
   - Automatically detects user's plan (Basic/Standard/Premium)
   - Shows current usage vs limit
   - Visual progress bar

2. **Purchase System**
   - R5 per extra photo
   - Uses wallet balance
   - Instant limit increase
   - Transaction history recorded

3. **Validation**
   - Client-side: Prevents over-upload
   - Server-side: Validates on save
   - Clear error messages

4. **User Interface**
   - Limit indicator on edit page
   - Warning when limit reached
   - Easy purchase modal
   - Quantity selector with +/- buttons

### 🎯 User Journey

```mermaid
User editing listing
    ↓
Uploads photos (within limit) → ✅ Saves successfully
    ↓
Reaches limit (3/3)
    ↓
Tries to add more → ⚠️ Warning appears
    ↓
Clicks "Purchase extra slots"
    ↓
Modal opens → Selects quantity
    ↓
Has balance? 
    Yes → Purchase succeeds → Limit increases → Can upload more
    No → "Insufficient balance" warning → Purchase blocked
```

### 💰 Pricing

| Item | Price |
|------|-------|
| Extra Photo Slot | R5.00 |
| 5 Extra Slots | R25.00 |
| 10 Extra Slots | R50.00 |

### 📊 Plan Limits

| Plan | Default Photos | Price | Can Purchase More |
|------|----------------|-------|-------------------|
| Basic | 3 | R49 | ✅ Yes |
| Standard | 10 | R64 | ✅ Yes |
| Premium | 20 | R74 | ✅ Yes |

## Technical Details

### API Endpoints

**GET /api/wallet**
- Returns user's wallet balance

**POST /api/properties/[id]/purchase-photos**
- Body: `{ numberOfPhotos: 2 }`
- Deducts from wallet
- Increases maxImages
- Returns new limit and balance

**PATCH /api/properties/[id]**
- Validates photo count vs maxImages
- Rejects if exceeded

### Database Fields

```sql
-- Property table
listingPlan VARCHAR    -- 'basic', 'standard', 'premium'
maxImages INT          -- Current photo limit (can increase)

-- Wallet table
balance DECIMAL(10,2)  -- Available funds

-- WalletTransaction table
type VARCHAR           -- 'DEBIT' for purchases
amount DECIMAL(10,2)   -- Cost of purchase
referenceType VARCHAR  -- 'PHOTO_PURCHASE'
```

## Testing Commands

### Test Purchase Flow
```bash
# 1. Start the application
npm run dev

# 2. Navigate to property edit page
# URL: /owner/properties/[id]/edit

# 3. Check current limit display
# 4. Upload photos to reach limit
# 5. Click "Purchase extra slots"
# 6. Verify modal opens with correct info
# 7. Purchase 1-2 slots
# 8. Verify limit increases
# 9. Verify wallet balance decreases
# 10. Upload additional photos
```

### Verify Database
```sql
-- Check wallet transactions
SELECT * FROM wallet_transactions 
WHERE type = 'DEBIT' 
  AND reference_type = 'PHOTO_PURCHASE'
ORDER BY created_at DESC;

-- Check property limits
SELECT id, title, listing_plan, max_images
FROM properties
WHERE owner_id = '[user_id]';
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Insufficient balance | Purchase button disabled, warning shown |
| Network error | Error message, no wallet deduction |
| Photo limit exceeded | Clear message with current limit |
| Concurrent purchases | Transaction ensures atomicity |

## Success Indicators ✅

- [x] Photos respect plan limits
- [x] Purchase modal works
- [x] Wallet balance deducted correctly
- [x] Limits increase immediately
- [x] Users can upload after purchase
- [x] Validation prevents over-upload
- [x] Build succeeds with no errors
- [x] All components type-safe

## Need Help?

**Can't upload photos?**
- Check your current limit in the progress bar
- If at limit, use "Purchase extra slots"
- Ensure you have wallet balance

**Purchase not working?**
- Verify wallet has sufficient balance
- Check browser console for errors
- Try refreshing the page

**Limit not updating?**
- Reload the page after purchase
- Check your wallet transaction history
- Contact support if persists

---

🎉 **System is fully functional and production-ready!**
