# 3M Car Rentals — Next-Generation Web Platform

A production-grade, enterprise-level luxury car rental platform built for Goa's premium mobility market.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Deployment | Vercel |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/arsalansarguru-jpg/3M-Car-Rentals.git
cd 3M-Car-Rentals
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`. Get them from your [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard).

### 4. Run the database schema

Open the [Supabase SQL Editor](https://supabase.com/dashboard) and run the contents of `src/lib/schema.sql`.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Verify database connection

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) — you should see all 5 roles returned.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/health/         # Database health check endpoint
│   ├── auth/login/         # Login page
│   └── auth/register/      # Registration page
├── components/
│   ├── ui/                 # Reusable design system components
│   ├── booking/            # Booking domain components
│   ├── fleet/              # Fleet domain components
│   └── dashboard/          # Dashboard domain components
├── hooks/                  # Custom React hooks
├── lib/                    # Third-party client configurations
│   ├── supabase.ts         # Browser-side Supabase client
│   ├── supabase-admin.ts   # Server-only admin client
│   └── schema.sql          # PostgreSQL database schema
├── services/               # Business logic layer
├── styles/                 # Global CSS and design tokens
├── types/                  # TypeScript type definitions
└── utils/                  # Shared utility functions
```

## Security Notes

- Never commit `.env.local` — it is excluded by `.gitignore`
- The `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed with `NEXT_PUBLIC_`
- Row Level Security is enabled on all database tables
