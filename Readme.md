# Co-working Space Desk Reservation Backend

Robust, scalable REST API service for managing co-working spaces, desk reservations, user management, and administrative operations. Built with Express.js, TypeScript, and Prisma ORM, deployed on Vercel Serverless.

## 🚀 Live Production Deployment

- **Production API Base URL**: [https://co-working-space-desk-backend.vercel.app](https://co-working-space-desk-backend.vercel.app)
- **Live Swagger Documentation**: [https://co-working-space-desk-backend.vercel.app/api-docs](https://co-working-space-desk-backend.vercel.app/api-docs)
- **Health Check**: [https://co-working-space-desk-backend.vercel.app/health](https://co-working-space-desk-backend.vercel.app/health)

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v20+ / v22 / v24)
- **Framework**: Express.js 5
- **Language**: TypeScript 5
- **Database & ORM**: PostgreSQL (Neon Cloud Serverless) & Prisma 5
- **Authentication**: JWT (Access Token + Refresh Token) & bcryptjs
- **Documentation**: Swagger UI & OpenAPI 3.0
- **Validation**: Zod schema validation
- **Deployment**: Vercel Serverless Functions (`api/index.ts` + `vercel.json`) & Docker

---

## 📁 Project Structure

```
├── api/
│   └── index.ts               # Vercel Serverless Entrypoint (Exports Express app)
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Database seed script (Admin, Member, Spaces, Bookings)
├── src/
│   ├── app.ts                 # Express application configuration & route mounting
│   ├── index.ts               # Local development server entrypoint
│   ├── config/                # Configuration (Prisma, Swagger)
│   ├── middleware/            # Auth, RBAC, error handling, rate limiting
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication & Token Refresh
│   │   ├── users/             # User Management & Profiles
│   │   ├── spaces/            # Space & Desk Catalog Management
│   │   ├── bookings/          # Reservation & Check-in/out
│   │   ├── availability/      # Real-time Desk Availability Search
│   │   ├── maintenance/       # Maintenance Ticket Management
│   │   ├── roles/             # Role-based Access Control (RBAC)
│   │   ├── permissions/       # Fine-grained Permissions
│   │   └── dashboard/         # Admin Analytics & Dashboard KPIs
│   └── utils/                 # Helpers (AppError, ApiResponse)
├── tests/
│   └── test-all-apis.ts       # Comprehensive E2E test suite covering 51 APIs
├── vercel.json                # Vercel routing rewrites configuration
├── Dockerfile                 # Multi-stage production container build
└── docker-compose.yml         # Local Docker setup
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```env
# Server Configuration
PORT=5000
NODE_ENV=production
BACKEND_URL="https://co-working-space-desk-backend.vercel.app"
API_BASE_URL="https://co-working-space-desk-backend.vercel.app"

# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-host.aws.neon.tech/neondb?sslmode=require"

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=100m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration (Comma-separated origins)
CORS_ORIGIN="http://localhost:5173,http://localhost:3000,https://co-working-space-desk-backend.vercel.app"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

### 3. Run Database Migrations / Seed Data
```bash
npx prisma db push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

### 5. Run All 51 API Tests
```bash
npm run test:apis
```

---

## ☁️ Vercel Deployment

This project is configured out-of-the-box for Vercel deployment:
- `vercel.json` rewrites all requests `/(.*)` to the `/api` serverless handler.
- `api/index.ts` exports the configured Express application.
- `package.json` includes `postinstall` and `vercel-build` to ensure Prisma Client is generated on Vercel's build environment.

To deploy via Vercel CLI:
```bash
vercel --prod
```
Or simply connect your GitHub repository to Vercel and set the environment variables in the Vercel Project Settings.
