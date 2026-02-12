# Product Overview: ReachInbox

**ReachInbox** is a focused email scheduling tool designed for reliability. Write emails now, send them later.

## Who is it for?
Professionals who value deep work and async communication. It allows you to batch-process your email writing and schedule them for optimal delivery times, ensuring your message lands when it's most likely to be read.

## Key Features
- **Reliable Scheduling:** powered by a persistent Redis queue (BullMQ), jobs survive server restarts and crashes.
- **Smart Queueing:** rate-limited background workers ensure delivery without overwhelming mail servers.
- **Calm Interface:** a distraction-free environment to focus on the content of your message.

## How it Works
1. **Frontend:** Next.js application for composing and managing scheduled emails.
2. **Backend:** Express.js API that accepts jobs and persists them to PostgreSQL.
3. **Queue:** BullMQ + Redis handles the timing. When the time comes, a dedicated worker process picks up the job and sends the email via NodeMailer.

## Technology Stack
- **Frontend:** Next.js, Tailwind CSS, React Query
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Queue:** Redis, BullMQ
