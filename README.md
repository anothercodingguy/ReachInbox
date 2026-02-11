# ReachInbox - Simplified Email Worker System

A robust and scalable email scheduling system built with a "One Email = One Job" philosophy. Designed for clarity, reliability, and ease of understanding.

## Core Architecture

### Philosophy: Simplicity First
- **One Email = One DB Row = One BullMQ Job**: Each scheduled email corresponds directly to a single database record and a single background job. This eliminates complex relationships and state management.
- **Idempotency**: The email ID is used as the job ID, ensuring that the same email is never processed twice.
- **Global Rate Limiting**: A simple Redis-based counter enforces a global send limit (e.g., 100 emails/hour) to prevent IP reputation damage.

### Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Queue**: BullMQ (Redis-backed)
- **Email**: Nodemailer (Ethereal for testing)
- **Frontend**: Next.js, Tailwind CSS

## Simplified Database Schema
We use a single table to track email status:

```prisma
model Email {
  id          String   @id @default(cuid())
  recipient   String
  subject     String
  body        String   @db.Text
  status      String   @default("SCHEDULED") // SCHEDULED, SENT, FAILED
  scheduledAt DateTime
  sentAt      DateTime?
  error       String?
  createdAt   DateTime @default(now())
}
```

## Worker Logic (The "Brain")
The worker (`src/worker.ts`) follows a linear, easy-to-reason-about flow for every job:
1. **Fetch Email**: Retrieve the email record from the DB.
2. **Check Status**: If already `SENT` or `FAILED`, skip (idempotency).
3. **Check Global Rate Limit**:
   - Increment a Redis key `emails:hour:YYYY-MM-DD-HH`.
   - If limit exceeded, delay the job strictly until the next hour.
4. **Send Email**: delivering via SMTP.
5. **Update DB**: Mark as `SENT` (with timestamp) or `FAILED` (with error).

## Setup & Running

### Prerequisites
- Node.js & npm
- Docker (for Postgres & Redis)

### 1. Start Infrastructure
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push  # distinct from migrate, for rapid prototyping
npm run dev
```
Server runs on `http://localhost:4000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:3000`.

## API Endpoints

### `POST /api/emails`
Schedule a new email campaign.
- Body: `{ recipient, subject, body, scheduledAt }`

### `GET /api/emails`
List all emails (Scheduled, Sent, Failed).
