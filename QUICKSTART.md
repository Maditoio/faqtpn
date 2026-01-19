# Quick Start Guide

## Prerequisites
- Node.js v18+
- PostgreSQL v14+
- macOS (or Linux/Windows with PostgreSQL)

## 5-Minute Setup

### Option 1: Automated Setup (macOS)
```bash
./setup.sh
```
This script will:
- Check prerequisites
- Start PostgreSQL if needed
- Create database
- Install dependencies
- Run migrations
- Seed test data

### Option 2: Manual Setup

1. **Start PostgreSQL**
   ```bash
   brew services start postgresql@15
   ```

2. **Create Database**
   ```bash
   createdb property_rental_db
   ```

3. **Configure Environment**
   Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://YOUR_USER:YOUR_PASS@localhost:5432/property_rental_db"
   ```

4. **Install & Setup**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   Visit: http://localhost:3000

## Test Accounts

### Super Admin
- **Email**: admin@renthub.com
- **Password**: Admin@123
- **Access**: Full platform management

### Property Owner
- **Email**: owner@example.com
- **Password**: Owner@123
- **Access**: Create and manage properties

### Regular User (Renter)
- **Email**: user@example.com
- **Password**: User@123
- **Access**: Browse and favorite properties

## Quick Test Flow

### As a User (Renter)
1. Login with `user@example.com`
2. Click "Browse Properties"
3. Use search and filters
4. Click heart icon to favorite a property
5. Go to "Dashboard" to see your favorites

### As a Home Owner
1. Login with `owner@example.com`
2. Go to "My Properties"
3. Click "Add Property"
4. Fill in property details
5. Submit (will be pending approval)

### As Admin
1. Login with `admin@renthub.com`
2. Go to "Admin Panel"
3. See pending properties
4. Click checkmark to approve
5. Switch to "Users" tab to manage users

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Visual database browser
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create & apply migration
npx prisma db seed       # Seed database
npx prisma migrate reset # Reset database

# Troubleshooting
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
brew services restart postgresql@15  # Restart PostgreSQL
```

## Project Structure
```
src/
├── app/
│   ├── api/                 # API routes
│   ├── auth/                # Login/Register pages
│   ├── properties/          # Property browsing
│   ├── dashboard/           # User dashboard
│   ├── owner/               # Owner dashboard
│   └── admin/               # Admin dashboard
├── components/              # UI components
└── lib/                     # Utilities
```

## Key Features

✅ Secure authentication with NextAuth
✅ Role-based access (User, Owner, Admin)
✅ Property CRUD operations
✅ Advanced search and filters
✅ Favorites system
✅ Admin approval workflow
✅ Responsive design
✅ Production-ready security

## Next Steps

1. **Explore the App**: Try all three user roles
2. **Read Documentation**: Check README.md for details
3. **Customize**: Modify components to fit your needs
4. **Deploy**: Follow DEPLOYMENT.md when ready

## Troubleshooting

### "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
brew services list

# Restart if needed
brew services restart postgresql@15

# Verify database exists
psql -l | grep property_rental_db
```

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Migration failed"
```bash
npx prisma migrate reset
npx prisma db seed
```

## Support

- Check logs in terminal
- Use Prisma Studio to inspect database
- Review audit logs for admin actions
- See PROJECT_SUMMARY.md for architecture details

## What's Next?

After setup, you can:
- Add real property images
- Integrate payment processing
- Add email notifications
- Implement map views
- Add property comparison
- Deploy to production

---

Ready to build? Run `npm run dev` and start coding! 🚀
