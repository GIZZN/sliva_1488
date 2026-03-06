# Кристалл Авто - Car Wash Service

Modern car wash service website built with Next.js 15, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5
- **Styling**: CSS Modules
- **Animation**: GSAP 3.14
- **Authentication**: Clerk + Custom DB Auth
- **Database**: PostgreSQL (direct connection, no ORM)
- **UI Components**: React 19

## Project Structure

```
sliva_fix/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (pages)/           # Page routes
│   │   │   ├── about/         # About page
│   │   │   ├── booking/       # Booking page
│   │   │   ├── contacts/      # Contacts page
│   │   │   ├── profile/       # User profile
│   │   │   └── terms/         # Terms page
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth endpoints (login, register, logout, me)
│   │   │   ├── users/         # User sync endpoint
│   │   │   └── webhooks/      # Clerk webhook
│   │   ├── auth/              # Auth page (fallback)
│   │   ├── components/        # React components
│   │   │   ├── Header/        # Header with AuthModal
│   │   │   └── Footer/        # Footer component
│   │   ├── sso-callback/      # OAuth callback handler
│   │   ├── utils/             # Utility functions
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── lib/                   # Shared libraries
│   │   └── db.ts              # PostgreSQL connection
│   └── middleware.ts          # Route protection
├── database/
│   └── init.sql               # Database schema
├── public/                    # Static assets
└── docs/                      # Documentation
    ├── DATABASE_SETUP.md      # Database setup guide
    └── QUICK_START.md         # Quick start guide
```

## Features

- ✅ Modern minimalist design (white-red-black color scheme)
- ✅ Glassmorphism effects with backdrop blur
- ✅ GSAP animations (radial button fills, smooth transitions)
- ✅ Swipeable stat cards with touch support
- ✅ Dual authentication (Clerk OAuth + Custom DB)
- ✅ PostgreSQL database with direct SQL queries
- ✅ Responsive design
- ✅ TypeScript for type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (`.env`):
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cristal
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your_jwt_secret
```

3. Set up PostgreSQL database:
```bash
psql -U postgres -f database/init.sql
```

4. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Authentication

The app supports two authentication methods:

1. **Clerk OAuth** - Google sign-in via Clerk
2. **Custom DB Auth** - Email/password stored in PostgreSQL

Both methods work seamlessly together through the AuthModal component.

## Database

Direct PostgreSQL connection without ORM for maximum performance and control. Schema includes:
- `users` table (id, email, name, clerk_id, password, created_at)
- `bookings` table (id, user_id, service, date, time, status, created_at)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

Private project
