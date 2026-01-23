#!/bin/bash

# Run Prisma migrations on production database
# Usage: ./migrate-production.sh "your-neon-database-url"

if [ -z "$1" ]; then
  echo "❌ Error: Database URL is required"
  echo "Usage: ./migrate-production.sh \"postgresql://user:pass@ep-xyz.region.neon.tech/dbname\""
  echo ""
  echo "You can find your Neon DATABASE_URL in:"
  echo "1. Vercel Dashboard → Your Project → Settings → Environment Variables"
  echo "2. Or Neon Dashboard → Connection Details"
  exit 1
fi

DATABASE_URL="$1"

echo "🚀 Running migrations on production database..."
echo "📊 Database: ${DATABASE_URL%%\?*}" # Show URL without query params
echo ""

# Run the migration
DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migrations applied successfully!"
  echo ""
  echo "📝 Next steps:"
  echo "1. Redeploy your Vercel app (or wait for auto-deploy)"
  echo "2. Test creating a property draft"
else
  echo ""
  echo "❌ Migration failed. Please check the error above."
  exit 1
fi
