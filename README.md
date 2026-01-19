# RentHub - Property Rental Platform

A secure, production-ready property rental web application built with Next.js, PostgreSQL, and Prisma. Allows property owners to list properties and users to browse, favorite, and contact owners.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js with JWT
- **Validation**: Zod
- **Security**: bcryptjs, CSRF protection, rate limiting ready

## 👥 User Roles

### 1. Home Owner
- Register and login
- Create, edit, and delete properties
- Upload property images
- Set price, location, bedrooms, bathrooms
- View users who favorited their properties

### 2. User (Renter)
- Register and login
- Browse properties with search and filters
- Add/remove properties from favorites
- View saved favorites

### 3. Super Admin
- Login only (no public registration)
- Manage users and property owners
- Approve or suspend listings
- Full access dashboard

## 🗄️ Database Schema

The application uses PostgreSQL with the following core tables:

- `users` - All user accounts with role-based access
- `properties` - Property listings with full details
- `favorites` - Many-to-many relationship for user favorites
- `property_images` - Property images storage
- `audit_logs` - Admin actions and security events
- `sessions` - NextAuth session management

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v14 or higher) running locally
3. **npm** or **yarn** package manager

### Setting up PostgreSQL on macOS

```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb property_rental_db

# Or using psql
psql postgres
CREATE DATABASE property_rental_db;
\q
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Update the `.env` file with your database credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/property_rental_db?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Application Settings
NODE_ENV="development"
```

**Important**: Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Seed database with test data
npx prisma db seed
```

The seed command will create:
- Super Admin account: `admin@renthub.com` / `Admin@123`
- Home Owner account: `owner@example.com` / `Owner@123`
- Regular User account: `user@example.com` / `User@123`
- Sample properties

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests (Optional)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for detailed test documentation.

## 🎯 Key Features

### Security Features
- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ JWT-based authentication with NextAuth
- ✅ Role-based access control (RBAC)
- ✅ Server-side input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ Secure session management
- ✅ Environment variable protection
- ✅ Audit logging for admin actions

### UI/UX Features
- ✅ Circular icon containers throughout (design requirement)
- ✅ Responsive mobile-first design
- ✅ Clean, professional neutral color palette
- ✅ Loading states and skeletons
- ✅ Empty states with CTAs
- ✅ Role-specific dashboards
- ✅ Real-time search and filtering

### Core Functionality
- ✅ User registration and authentication
- ✅ Property CRUD operations
- ✅ Advanced search and filtering
- ✅ Favorites system (many-to-many)
- ✅ Admin approval workflow
- ✅ Property status management
- ✅ User management

## 📁 Project Structure

```
faqtpn/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seeding script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── properties/ # Property CRUD
│   │   │   ├── favorites/ # Favorites management
│   │   │   ├── admin/     # Admin endpoints
│   │   │   └── owner/     # Owner-specific endpoints
│   │   ├── auth/          # Auth pages (login, register)
│   │   ├── properties/    # Property browsing
│   │   ├── dashboard/     # User dashboard
│   │   ├── owner/         # Owner dashboard
│   │   ├── admin/         # Admin dashboard
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Homepage
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── icons/         # Icon components
│   │   ├── layout/        # Layout components (Navbar)
│   │   ├── properties/    # Property-specific components
│   │   └── providers/     # Context providers
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client
│   │   ├── auth.ts        # Auth utilities
│   │   ├── auth-options.ts # NextAuth configuration
│   │   ├── authorization.ts # Authorization helpers
│   │   └── validations.ts  # Zod schemas
│   └── types/
│       └── next-auth.d.ts  # NextAuth type extensions
├── .env                    # Environment variables
├── .env.example           # Environment template
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Properties
- `GET /api/properties` - Get all approved properties (public)
- `POST /api/properties` - Create property (owner/admin)
- `GET /api/properties/[id]` - Get single property
- `PATCH /api/properties/[id]` - Update property (owner/admin)
- `DELETE /api/properties/[id]` - Delete property (owner/admin)

### Favorites
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/[id]` - Remove from favorites

### Owner
- `GET /api/owner/properties` - Get owner's properties
- `GET /api/owner/properties/[id]/favorites` - Get property favorites

### Admin
- `GET /api/admin/properties` - Get all properties
- `PATCH /api/admin/properties/[id]` - Approve/suspend property
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## 🧪 Testing the Application

### 1. Test as Regular User
1. Login with `user@example.com` / `User@123`
2. Browse properties at `/properties`
3. Add properties to favorites
4. View dashboard at `/dashboard`

### 2. Test as Home Owner
1. Login with `owner@example.com` / `Owner@123`
2. View properties at `/owner/dashboard`
3. Create new property at `/owner/properties/new`
4. Edit or delete existing properties

### 3. Test as Super Admin
1. Login with `admin@renthub.com` / `Admin@123`
2. Access admin panel at `/admin/dashboard`
3. Approve/suspend properties
4. Manage users

## 🗃️ Database Management

### View Database with Prisma Studio
```bash
npx prisma studio
```
Opens at [http://localhost:5555](http://localhost:5555)

### Reset Database
```bash
npx prisma migrate reset
npx prisma db seed
```

### Create New Migration
```bash
npx prisma migrate dev --name description_of_changes
```

## 🚢 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
Ensure these are set securely:
- `DATABASE_URL` - Production PostgreSQL connection string
- `NEXTAUTH_SECRET` - Strong random secret (use `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production domain
- `NODE_ENV="production"`

### Security Checklist
- [ ] Change all default passwords
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable PostgreSQL SSL
- [ ] Regular security audits
- [ ] Keep dependencies updated

## 🎨 Design System

### Colors
- Primary: Blue (`#2563EB`)
- Success: Green
- Warning: Yellow
- Danger: Red
- Neutral: Gray scale

### Icons
All icons are wrapped in circular containers as per design requirements.

## 📝 Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

### Prisma Scripts
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list

# Restart PostgreSQL
brew services restart postgresql@15

# Check connection
psql -U postgres -d property_rental_db
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Prisma Issues
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear Prisma cache
rm -rf node_modules/.prisma
npm install
```

## 📧 Support

For issues or questions, please check the application logs or database audit logs for detailed error information.

---

Built with ❤️ using Next.js, PostgreSQL, and Prisma
