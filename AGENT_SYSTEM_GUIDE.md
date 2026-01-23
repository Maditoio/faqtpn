# Agent Referral & Wallet System

## Overview
A comprehensive agent referral system where users can become agents, refer property owners, earn commissions, and manage their earnings through a built-in wallet.

**Key Feature**: This is a unique feature that sets us apart from competitors - "no one else has this feature"

## Features Implemented

### 1. Database Schema
- **AgentProfile**: Stores agent information and unique referral codes
- **Wallet**: Tracks user balance, total earned, and total spent
- **WalletTransaction**: Records all wallet activities with full audit trail
- **SystemSettings**: Admin-configurable settings (commission rates)
- **Property**: Extended with referral tracking (`referredBy`, `commissionPaid`, `commissionAmount`)

### 2. Agent Dashboard (`/agent`)
Located at: `src/app/agent/page.tsx`

Features:
- Auto-generates unique referral code for new agents
- Displays wallet balance and total earnings
- Shows referral statistics (total referrals, commission rate)
- Provides copyable referral link
- Lists recent wallet transactions
- Shows all referred properties with commission details

Stats Cards:
- Wallet Balance (current available funds)
- Total Earned (lifetime earnings)
- Total Referrals (number of successful referrals)
- Commission Rate (personalized rate, default 4%)

### 3. Referral Tracking
**How it works:**
1. Agent shares their referral link: `/list-property?ref=AGXXXXXXXX`
2. Property owner clicks link and lists property
3. When owner pays for listing, commission is automatically calculated and credited
4. Agent receives commission instantly in their wallet

**Implementation:**
- Referral code captured in URL params (`ref` parameter)
- `PropertyWizard` fetches agent ID from referral code via API
- Agent ID stored with property (`referredBy` field)
- Commission processed automatically when `paymentStatus === 'paid'`

### 4. Commission Processing
Located in: `src/app/api/properties/route.ts`

**Automatic Commission Flow:**
1. Property created with referral and payment
2. System fetches agent's commission rate from `AgentProfile`
3. Calculates commission: `listingPrice × (commissionRate / 100)`
4. Credits wallet with commission amount
5. Creates transaction record for audit trail
6. Updates property with commission paid status
7. Increments agent's total earnings and referrals

**Transaction Safety:**
- Uses Prisma transactions to ensure atomicity
- If commission fails, property creation still succeeds
- Full error logging for debugging

### 5. Navigation & Discovery
- **SecondaryNav**: New toolbar below main navbar
- "Become an Agent & Earn" link prominently displayed
- Requires authentication to access agent dashboard
- Available to all logged-in users (any role)

### 6. Admin Settings
Located at: `src/app/admin/settings/page.tsx`

Features:
- Configure default commission rate (default: 4%)
- View agent statistics:
  - Total agents registered
  - Total commissions paid
  - Total referrals
- Top performing agents table
- Agent status management (active/inactive)

### 7. API Endpoints

#### Verify Referral Code
```
GET /api/agent/verify-referral?code=AGXXXXXXXX
```
Returns agent ID and name if code is valid and active.

#### Admin Settings
```
PUT /api/admin/settings
Body: { key: "agent_commission_rate", value: "4.0" }
```
Updates system-wide settings (admin only).

## Commission Rate
- **Default**: 4% (configurable by admin)
- Applied to listing price, not rental price
- Example: R49 listing → R1.96 commission at 4%
- Can be customized per agent in database

## Database Migration
Migration file: `20260123134331_add_agent_referral_wallet_system`

**New Tables:**
- `agent_profiles`
- `wallets`
- `wallet_transactions`
- `system_settings`

**Modified Tables:**
- `properties` (added referral tracking fields)
- `users` (added agent relations)

**Production Deployment:**
```bash
# Local development
npx prisma migrate dev

# Production (Neon)
export DATABASE_URL="your_production_db_url"
npx prisma migrate deploy
```

## User Flow Examples

### Becoming an Agent
1. User logs in
2. Clicks "Become an Agent & Earn" in secondary nav
3. Redirected to `/agent` dashboard
4. System auto-creates `AgentProfile` with unique referral code
5. Wallet created automatically
6. Agent can copy and share referral link

### Property Owner Using Referral
1. Clicks agent's referral link: `/list-property?ref=AGXXXXXXXX`
2. Signs up or logs in
3. Completes property listing wizard
4. Chooses pricing plan and pays
5. Commission automatically credited to agent's wallet
6. Property marked with referral information

### Agent Earning Commission
1. Agent shares referral link on social media
2. Property owner lists and pays via that link
3. Agent dashboard instantly shows new transaction
4. Wallet balance increases
5. Agent can view transaction details
6. Can use wallet balance for future purchases (future feature)

## Security & Validation
- Referral codes are unique and indexed
- Only active agents can receive commissions
- Transactions are atomic (all-or-nothing)
- Admin-only access to settings
- Audit trail for all wallet activities

## Future Enhancements (Not Yet Implemented)

### Wallet Payment at Checkout
- Allow users to pay for listings using wallet balance
- Combine wallet + card payment if insufficient funds
- Deduct from wallet and create transaction record

### Email Notifications
- Agent earns commission → send email notification
- Include: property name, commission amount, new balance
- Monthly earnings summary
- Wallet payment receipts

### Withdrawal System
- Agent can request withdrawals
- Admin approval process
- Bank account verification
- Transfer history tracking

### Agent Tiers
- Bronze/Silver/Gold based on performance
- Higher tiers get better commission rates
- Unlock bonuses at milestones

## Technical Notes

### TypeScript Types
- Commission amounts use `Decimal` type for precision
- Agent IDs stored as UUIDs
- Transaction types: 'CREDIT' | 'DEBIT'

### Performance
- Dashboard loads server-side for security
- Transactions limited to 10 most recent
- Agent stats cached where possible

### Error Handling
- Commission processing isolated from property creation
- Failed commissions logged but don't block listings
- Invalid referral codes fail gracefully

## Files Created/Modified

### New Files
- `src/app/agent/page.tsx` - Agent dashboard
- `src/components/layout/SecondaryNav.tsx` - Secondary navigation
- `src/app/api/agent/verify-referral/route.ts` - Referral verification
- `src/app/admin/settings/page.tsx` - Admin settings page
- `src/app/admin/settings/SettingsForm.tsx` - Settings form component
- `src/app/api/admin/settings/route.ts` - Settings API

### Modified Files
- `prisma/schema.prisma` - Added 4 new models, extended existing
- `src/components/property/PropertyWizard.tsx` - Referral tracking
- `src/app/api/properties/route.ts` - Commission processing
- `src/app/layout.tsx` - Added SecondaryNav
- `src/components/ui/Input.tsx` - UI improvements (square borders, darker text)
- `src/components/ui/TextArea.tsx` - UI improvements (square borders, darker text)
- `src/components/property/PricingSelector.tsx` - Simplified UI

## Testing Checklist
- [ ] Create agent profile automatically on first visit
- [ ] Generate unique referral codes
- [ ] Verify referral code API
- [ ] Track referral through property creation
- [ ] Calculate commission correctly
- [ ] Credit wallet on property payment
- [ ] Display transactions in dashboard
- [ ] Admin can change commission rate
- [ ] Agent stats display correctly
- [ ] Referral link copyable and functional

## Support & Maintenance
- Monitor commission calculations in logs
- Review agent performance monthly
- Adjust default commission rate as needed
- Investigate any failed commission transactions
- Ensure wallet balances reconcile with transactions
