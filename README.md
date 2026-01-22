# 📧 ReachInbox - Email Job Scheduler

A production-grade full-stack email scheduling application built with TypeScript, featuring a Next.js frontend, Express.js backend, BullMQ job queue, and PostgreSQL database.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## 🎯 Features

- **Google OAuth Authentication** via NextAuth.js
- **Email Scheduling** with precise datetime control
- **CSV Bulk Upload** for batch email scheduling
- **BullMQ Job Queue** with Redis persistence
- **Rate Limiting** with atomic Lua script (configurable hourly limits)
- **Ethereal SMTP Integration** for email testing
- **Bull Board Admin UI** for queue monitoring
- **Auto-recovery** - Jobs persist across restarts
- **Idempotent Processing** - No duplicate sends

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│   Next.js App   │────────▶│  Express API    │
│   (Frontend)    │         │   (Backend)     │
│                 │         │                 │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │                 │
                            │    BullMQ       │
                            │    Queue        │
                            │                 │
                            └────────┬────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│               │         │                 │         │                 │
│  PostgreSQL   │         │     Redis       │         │   Worker        │
│  (Database)   │         │   (Queue)       │         │  (Processor)    │
│               │         │                 │         │                 │
└───────────────┘         └─────────────────┘         └────────┬────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────────┐
                                                      │                 │
                                                      │  Ethereal SMTP  │
                                                      │  (Email Test)   │
                                                      │                 │
                                                      └─────────────────┘
```

## 📁 Project Structure

```
ReachinboxAssignment/
├── backend/                    # Express.js API & Worker
│   ├── src/
│   │   ├── index.ts           # Express server entry
│   │   ├── worker.ts          # BullMQ worker process
│   │   ├── lib/
│   │   │   ├── prisma.ts      # Prisma client
│   │   │   ├── redis.ts       # Redis connection
│   │   │   ├── queue.ts       # BullMQ queue setup
│   │   │   ├── mailer.ts      # Nodemailer/Ethereal
│   │   │   └── rateLimiter.ts # Lua-based rate limiter
│   │   ├── routes/
│   │   │   └── emails.ts      # Email CRUD endpoints
│   │   └── __tests__/         # Unit & integration tests
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── Dockerfile
├── frontend/                   # Next.js Application
│   ├── app/
│   │   ├── page.tsx           # Login page
│   │   ├── dashboard/
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── compose/       # Email composer
│   │   │   ├── scheduled/     # Scheduled emails
│   │   │   └── sent/          # Sent emails
│   │   └── api/auth/          # NextAuth routes
│   ├── components/
│   │   └── Navbar.tsx
│   └── lib/
│       ├── api.ts             # API client
│       └── auth.ts            # Auth utilities
├── docker-compose.yml          # Redis & PostgreSQL
├── .env.example                # Environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Google OAuth credentials (see below)

### 1. Clone & Install

```bash
# Clone the repository
cd ReachinboxAssignment

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Configure OAuth Consent Screen
4. Create OAuth 2.0 Client ID credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret

### 3. Configure Environment

```bash
# From the root directory
cp .env.example .env

# Edit .env with your values:
# - GOOGLE_CLIENT_ID=your-client-id
# - GOOGLE_CLIENT_SECRET=your-client-secret
# - Generate a random NEXTAUTH_SECRET: openssl rand -base64 32
```

### 4. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### 5. Initialize Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 6. Start the Application

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
# API running at http://localhost:4000
# Bull Board at http://localhost:4000/admin/queues
```

**Terminal 2 - Worker:**
```bash
cd backend
npm run worker
# Worker processing jobs...
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

## ☁️ Deployment on Render

This project includes a `render.yaml` Blueprint for easy deployment.

1. **Push to GitHub**: Ensure the code is in a GitHub repository.
2. **Create Web Service**: Go to Render.com and create a new Blueprint.
3. **Connect Repository**: Select your repository.
4. **Deploy**: Render will automatically create the database, Redis, API, Worker, and Frontend services.

### Post-Deployment Configuration

After deployment, update these environment variables in the Render Dashboard:

**Frontend Service:**
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `NEXTAUTH_URL`: Your Render frontend URL (e.g., `https://reachinbox-frontend.onrender.com`)
- `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g., `https://reachinbox-api.onrender.com`)

**Backend Service:**
- `FRONTEND_URL`: Your Render frontend URL

**Google Cloud Console:**
- Add your Render frontend callback URL to authorized redirect URIs:
  `https://your-frontend-url.onrender.com/api/auth/callback/google`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | See .env.example |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |
| `GOOGLE_CLIENT_ID` | OAuth client ID | Required |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | Required |
| `NEXTAUTH_SECRET` | NextAuth encryption key | Required |
| `NEXTAUTH_URL` | App URL | http://localhost:3000 |
| `WORKER_CONCURRENCY` | Concurrent jobs | 5 |
| `MIN_DELAY_MS` | Min delay between sends | 1000 |
| `RATE_LIMIT_PER_HOUR` | Max emails per hour | 100 |
| `ETHEREAL_USER` | Ethereal SMTP user | Auto-generated |
| `ETHEREAL_PASS` | Ethereal SMTP password | Auto-generated |

## 📊 Rate Limiting Strategy

### Sliding Window Algorithm

The rate limiter uses a **sliding window** approach with Redis Sorted Sets:

1. **Window Size**: 1 hour (configurable)
2. **Limit**: Configurable via `RATE_LIMIT_PER_HOUR`
3. **Atomic Operations**: Lua script ensures thread-safety

### Key Behaviors

- ✅ **No Job Loss**: Rate-limited jobs are delayed, never dropped
- ✅ **Smart Delay**: Jobs rescheduled to next available slot
- ✅ **Per-User Limits**: Each user has independent rate limits
- ✅ **Recoverable**: Limits persist across restarts

### Lua Script Logic

```lua
-- Simplified rate limit check
1. Remove expired entries (older than 1 hour)
2. Count current entries in window
3. If under limit: add entry, return allowed
4. If at limit: calculate wait time, return denied + wait time
```

## 🔄 Recovery & Idempotency

### After Restart

1. **BullMQ Jobs**: Persisted in Redis, auto-resumed
2. **Database State**: Email statuses tracked in PostgreSQL
3. **Deduplication**: JobId = EmailId prevents duplicate sends

### Idempotency Flow

```
Worker receives job →
  Check DB status →
    If SENT/CANCELLED → Skip
    If SCHEDULED → Process
```

## 🧪 Testing

### Unit Tests

```bash
cd backend
npm test
```

### Integration Tests

```bash
# Ensure Redis is running
cd backend
npm run test:integration
```

### Test Coverage

- Rate limiter atomic operations
- Counter increment/decrement
- Window expiration
- Concurrent request handling
- Job processing workflow
- Database status updates
- Idempotency checks

## 🎬 Demo Recording Script

**For a 5-minute demo video, follow these steps:**

### Setup (1 minute)
1. Show folder structure in VS Code
2. Show `docker-compose.yml` and explain services
3. Show the running terminals (API, Worker, Frontend)

### Authentication (30 seconds)
1. Open http://localhost:3000
2. Click "Continue with Google"
3. Complete OAuth flow
4. Land on dashboard

### Dashboard Overview (30 seconds)
1. Show stats cards (Scheduled, Sent, etc.)
2. Explain quick actions
3. Point out the Ethereal testing notice

### Schedule Single Email (1 minute)
1. Click "Compose Email"
2. Fill in recipient, subject, body
3. Set schedule time to 1 minute from now
4. Click "Schedule Email"
5. Show success toast
6. Navigate to Scheduled page
7. Show the email in the list

### Watch Email Send (1 minute)
1. Wait for scheduled time
2. Show the email moving to Sent
3. Click "View" button for Ethereal preview
4. Show the actual email in Ethereal

### CSV Bulk Upload (1 minute)
1. Go to Compose
2. Switch to "CSV Upload" tab
3. Show sample CSV format
4. Upload a test CSV
5. Show the preview
6. Schedule all emails

### Admin Panel (30 seconds)
1. Open http://localhost:4000/admin/queues
2. Show Bull Board interface
3. Explain job states
4. Show delayed jobs (if any)

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/emails` | Schedule email(s) |
| GET | `/api/emails` | List emails (with filters) |
| GET | `/api/emails/stats` | Get email statistics |
| GET | `/api/emails/:id` | Get email details |
| DELETE | `/api/emails/:id` | Cancel scheduled email |

### Example Request

```bash
curl -X POST http://localhost:4000/api/emails \
  -H "Content-Type: application/json" \
  -H "x-user-id: your-user-id" \
  -d '{
    "fromEmail": "sender@example.com",
    "emails": [{
      "toEmail": "recipient@example.com",
      "subject": "Test Email",
      "body": "<p>Hello World!</p>",
      "scheduledAt": "2024-01-15T10:30:00Z"
    }]
  }'
```

## 🐳 Docker Deployment

```bash
# Build and run everything
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

## 🔮 Assumptions & Design Decisions

1. **Ethereal for Testing**: All emails go to Ethereal's catch-all service for safe testing
2. **JWT Sessions**: Using JWT instead of database sessions for simplicity
3. **User ID from Headers**: Backend trusts x-user-id header (would use proper auth in production)
4. **Single Queue**: All emails go through one queue (could shard by user/priority)
5. **Basic Rate Limiting**: Per-user hourly limits (could add per-recipient, per-domain)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL 15, Prisma ORM |
| Queue | BullMQ, Redis 7 |
| Email | Nodemailer, Ethereal SMTP |
| Auth | NextAuth.js, Google OAuth |
| Testing | Vitest |
| Infrastructure | Docker, Docker Compose |

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ for the ReachInbox Assignment
