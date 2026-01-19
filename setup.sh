#!/bin/bash

# RentHub Setup Script
# This script helps set up the application on macOS

set -e

echo "🏠 RentHub - Property Rental Platform Setup"
echo "============================================"
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi
echo "✓ Node.js $(node -v) found"

# Check PostgreSQL
echo "🐘 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "   Install with: brew install postgresql@15"
    exit 1
fi
echo "✓ PostgreSQL found"

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL is not running"
    echo "   Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 3
fi
echo "✓ PostgreSQL is running"

# Check if database exists
echo "🗄️  Checking database..."
if ! psql -lqt | cut -d \| -f 1 | grep -qw property_rental_db; then
    echo "📝 Creating database 'property_rental_db'..."
    createdb property_rental_db
    echo "✓ Database created"
else
    echo "✓ Database already exists"
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🏗️  Running database migrations..."
npx prisma migrate dev --name init

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📖 Then open http://localhost:3000"
echo ""
echo "👤 Test accounts:"
echo "   Admin: admin@renthub.com / Admin@123"
echo "   Owner: owner@example.com / Owner@123"
echo "   User:  user@example.com / User@123"
echo ""
