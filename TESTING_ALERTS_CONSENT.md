# Testing Guide: Alerts Consent Feature

## Quick Start

Run the automated pre-check:
```bash
./test-alerts-consent.sh
```

Then follow the manual testing steps below.

## Setup

1. **Start the development server:**
```bash
npm run dev
```

2. **Open Prisma Studio (optional, for database monitoring):**
```bash
npx prisma studio
```
This opens at http://localhost:5555 where you can watch database changes in real-time.

## Test Scenarios

### Scenario 1: New User Without Consent

**Goal:** Verify users must give consent before creating alerts

1. **Login** to the application
2. **Navigate** to http://localhost:3000/alerts
3. **Expected:**
   - ✅ Blue informational banner appears
   - ✅ Banner says "Enable Alerts to Get Started"
   - ✅ "Create Alert" button is disabled (grayed out)
   - ✅ No alerts are displayed (or existing alerts shown but can't create new)

4. **Action:** Click "Enable Alerts Now" button in banner
5. **Expected:**
   - ✅ Modal appears with title "Enable Property Alerts?"
   - ✅ Modal shows benefits (3 checkmarks)
   - ✅ Modal shows privacy note
   - ✅ Two buttons: "Not Now" and "Enable Alerts"

### Scenario 2: Declining Consent

**Goal:** Verify users can decline without issues

1. **From the consent modal**, click "Not Now"
2. **Expected:**
   - ✅ Modal closes
   - ✅ Redirected to /properties page
   - ✅ No error messages

3. **Navigate back** to /alerts
4. **Expected:**
   - ✅ Banner still shows (consent not given)
   - ✅ Can try again anytime

### Scenario 3: Accepting Consent

**Goal:** Verify consent enables alert creation

1. **Navigate** to /alerts
2. **Click** "Enable Alerts Now"
3. **Click** "Enable Alerts" button in modal
4. **Expected:**
   - ✅ Loading state shows briefly ("Enabling...")
   - ✅ Success message: "Alerts enabled! You can now create property alerts."
   - ✅ Modal closes
   - ✅ Banner disappears
   - ✅ "Create Alert" button becomes active (blue, clickable)

5. **Click** "Create Alert" button
6. **Expected:**
   - ✅ Alert creation form appears
   - ✅ No modal, no errors

7. **Fill out form:**
   - Name: "Test Alert"
   - Location: "Johannesburg"
   - Property Type: "Apartment"
   - Min Price: 5000
   - Max Price: 15000

8. **Submit form**
9. **Expected:**
   - ✅ Alert created successfully
   - ✅ Alert appears in list

10. **Verify in database:**
```bash
npx prisma studio
```
- Open "User" table
- Find your user
- Check: `alerts_consent = true`
- Check: `alerts_consent_date` has a timestamp

### Scenario 4: Profile Management

**Goal:** Verify consent can be managed from profile

1. **Navigate** to /profile
2. **Scroll down** to "Property Alerts" section
3. **Expected:**
   - ✅ Section shows "Alert Notifications"
   - ✅ Green badge shows "Enabled"
   - ✅ Shows consent date: "Enabled on [date]"
   - ✅ "Disable" button visible
   - ✅ "Manage your alerts" link visible

4. **Click** "Disable" button
5. **Expected:**
   - ✅ Confirmation dialog: "Are you sure you want to disable alerts?"
   - ✅ Message: "Your saved alerts will not send notifications"

6. **Click** "Cancel" in confirmation
7. **Expected:**
   - ✅ Dialog closes
   - ✅ Alerts remain enabled

8. **Click** "Disable" again, then "OK"
9. **Expected:**
   - ✅ Success message: "Alerts disabled"
   - ✅ "Enabled" badge disappears
   - ✅ Button changes to "Enable"
   - ✅ "Manage your alerts" link disappears
   - ✅ Consent date still shows

10. **Navigate** to /alerts
11. **Expected:**
    - ✅ Banner appears again
    - ✅ "Create Alert" button disabled
    - ✅ Existing alerts still visible but can't create new

### Scenario 5: API Security

**Goal:** Verify API enforces consent

1. **Get your session cookie:**
   - Open browser DevTools (F12)
   - Go to Application > Cookies
   - Copy the session cookie value

2. **Test without consent:**
```bash
# First, disable consent from profile
# Then try to create alert via API

curl -X POST http://localhost:3000/api/alerts \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -d '{
    "name": "Test Alert",
    "location": "Pretoria"
  }'
```

**Expected Response:**
```json
{
  "error": "You must enable alerts in your settings before creating alerts"
}
```
**Status Code:** 403

3. **Enable consent from profile**

4. **Test with consent:**
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -d '{
    "name": "API Test Alert",
    "location": "Pretoria",
    "propertyType": "HOUSE",
    "minBedrooms": 2
  }'
```

**Expected Response:**
```json
{
  "alert": {
    "id": "uuid",
    "name": "API Test Alert",
    "location": "Pretoria",
    ...
  }
}
```
**Status Code:** 201

### Scenario 6: Re-enabling Consent

**Goal:** Verify consent can be re-enabled easily

1. **From profile**, with alerts disabled
2. **Click** "Enable" button
3. **Expected:**
   - ✅ No confirmation needed (enabling is non-destructive)
   - ✅ Success message: "Alerts enabled!"
   - ✅ "Enabled" badge appears
   - ✅ Consent date updates to new timestamp
   - ✅ "Manage your alerts" link appears

4. **Navigate** to /alerts
5. **Expected:**
   - ✅ No banner
   - ✅ "Create Alert" button enabled
   - ✅ Can create alerts immediately

## Database Verification

### Check User Consent Status
```sql
-- Via Prisma Studio or psql
SELECT 
  id, 
  name, 
  email, 
  alerts_consent, 
  alerts_consent_date,
  created_at
FROM users
WHERE email = 'your-test-email@example.com';
```

### Check Alerts for User
```sql
SELECT 
  id,
  name,
  location,
  is_active,
  created_at
FROM property_alerts
WHERE user_id = 'your-user-id';
```

## Edge Cases to Test

### Edge Case 1: Direct URL Access
1. Disable consent
2. Navigate directly to http://localhost:3000/alerts
3. Expected: Banner shows immediately

### Edge Case 2: Existing Alerts
1. Create alerts with consent enabled
2. Disable consent
3. Navigate to /alerts
4. Expected: Existing alerts visible but can't create new

### Edge Case 3: Multiple Browser Tabs
1. Open /alerts in two tabs
2. Enable consent in Tab 1
3. Refresh Tab 2
4. Expected: Tab 2 now shows enabled state

### Edge Case 4: Logout/Login
1. Enable consent
2. Logout
3. Login again
4. Navigate to /alerts
5. Expected: Consent persists (still enabled)

## Automated Testing (Optional)

Create a test file to automate API testing:

```bash
# Run API tests
npm test -- alerts-consent
```

## Common Issues & Solutions

### Issue: "Create Alert" button stays disabled
**Solution:** Check browser console for errors, verify API response includes consent status

### Issue: Consent modal doesn't appear
**Solution:** Check browser console, verify AlertConsentModal component is imported

### Issue: 403 error when creating alerts
**Solution:** Verify user's `alerts_consent = true` in database

### Issue: Consent doesn't persist
**Solution:** Check cache invalidation, try clearing cache: Clear browser cache and reload

## Success Criteria

All tests pass when:
- ✅ Users see consent request before creating first alert
- ✅ Users can decline and try again later
- ✅ Users can accept and create alerts immediately
- ✅ API blocks alert creation without consent (403)
- ✅ Profile page shows consent status correctly
- ✅ Users can disable/enable from profile
- ✅ Consent persists across sessions
- ✅ Database records consent date accurately
- ✅ UI updates immediately after consent changes
- ✅ No JavaScript errors in console

## Performance Testing

1. **Check API response times:**
```bash
# Should complete in < 200ms
time curl http://localhost:3000/api/profile \
  -H 'Cookie: next-auth.session-token=YOUR_TOKEN'
```

2. **Check cache effectiveness:**
- Make same API call twice
- Second call should be faster (cached)

## Clean Up After Testing

```bash
# Remove test alerts
npx prisma studio
# Delete test alerts manually

# Or via SQL
echo "DELETE FROM property_alerts WHERE name LIKE 'Test%' OR name LIKE 'API Test%';" | npx prisma db execute --stdin
```

## Next Steps After Testing

- [ ] Test with multiple users
- [ ] Test on mobile devices (responsive design)
- [ ] Test with different property types
- [ ] Integration test: Create property as admin, verify alert matching
- [ ] Load test: Many users with many alerts
- [ ] Email notification testing (when implemented)
