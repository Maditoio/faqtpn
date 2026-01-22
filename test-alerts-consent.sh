#!/bin/bash

# Alerts Consent Testing Script
# This script helps test the alerts consent feature

set -e

echo "🧪 Testing Alerts Consent Implementation"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo -e "${BLUE}Step 1: Checking if server is running...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Server is running${NC}"
else
    echo -e "${RED}✗ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Checking database connection...${NC}"
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is accessible${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Checking if alertsConsent columns exist...${NC}"
CONSENT_CHECK=$(npx prisma db execute --stdin <<< "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name IN ('alerts_consent', 'alerts_consent_date');" | grep -c "alerts_consent" || echo "0")

if [ "$CONSENT_CHECK" -ge 2 ]; then
    echo -e "${GREEN}✓ Consent columns exist in users table${NC}"
else
    echo -e "${RED}✗ Consent columns missing. Run: npx prisma migrate deploy${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 4: Checking user consent status...${NC}"
echo "SELECT id, name, email, alerts_consent, alerts_consent_date FROM users LIMIT 5;" | npx prisma db execute --stdin

echo ""
echo -e "${YELLOW}Manual Testing Checklist:${NC}"
echo "========================="
echo ""
echo "□ 1. Open browser to $BASE_URL"
echo "□ 2. Login with an existing user"
echo "□ 3. Navigate to /alerts"
echo "□ 4. Verify you see the consent banner (if consent not given)"
echo "□ 5. Click 'Enable Alerts Now'"
echo "□ 6. Verify the consent modal appears"
echo "□ 7. Click 'Enable Alerts'"
echo "□ 8. Verify success message appears"
echo "□ 9. Verify 'Create Alert' button is now enabled"
echo "□ 10. Create a test alert"
echo "□ 11. Navigate to /profile"
echo "□ 12. Verify 'Property Alerts' section shows 'Enabled'"
echo "□ 13. Click 'Disable' button"
echo "□ 14. Verify confirmation dialog appears"
echo "□ 15. Confirm disable"
echo "□ 16. Navigate back to /alerts"
echo "□ 17. Verify consent banner appears again"
echo "□ 18. Try to create alert → should show consent modal"
echo ""

echo -e "${YELLOW}API Testing Commands:${NC}"
echo "====================="
echo ""
echo "Test 1: Get profile (check consent status)"
echo -e "${BLUE}curl -X GET $BASE_URL/api/profile -H 'Cookie: <your-session-cookie>'${NC}"
echo ""
echo "Test 2: Enable consent"
echo -e "${BLUE}curl -X PATCH $BASE_URL/api/profile -H 'Content-Type: application/json' -H 'Cookie: <your-session-cookie>' -d '{\"alertsConsent\": true}'${NC}"
echo ""
echo "Test 3: Try creating alert without consent"
echo -e "${BLUE}curl -X POST $BASE_URL/api/alerts -H 'Content-Type: application/json' -H 'Cookie: <your-session-cookie>' -d '{\"name\": \"Test Alert\", \"location\": \"Johannesburg\"}'${NC}"
echo ""
echo "Expected: 403 error if consent not given"
echo ""

echo -e "${GREEN}✓ Pre-checks completed!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Start the dev server: npm run dev"
echo "2. Open browser to $BASE_URL"
echo "3. Follow the manual testing checklist above"
echo "4. Check database after each action:"
echo "   npx prisma studio"
echo ""
