# How It Works

## What ReachInbox Does

ReachInbox is an email scheduling system. You upload a CSV of email addresses, write your email, pick a send time, and the system delivers each email at the scheduled time.

## How Scheduling Works

1. You fill out the compose form in the dashboard.
2. The frontend sends a `POST /api/emails` request for each recipient.
3. The backend creates a database record and adds a job to the queue with a delay calculated from your chosen send time.

Each email gets one database row and one queue job. The email's database ID is reused as the job ID, so the same email can never be queued twice.

## How Background Jobs Work

A separate worker process picks jobs from the queue when their delay expires. For each job, the worker:

1. Looks up the email record in the database.
2. Checks if it's already been sent or failed (skips if so).
3. Checks the global rate limit.
4. Sends the email via SMTP.
5. Updates the database status to `SENT` or `FAILED`.

The worker runs independently from the API server. If the worker crashes and restarts, pending jobs are still in Redis and will be retried.

## Restart Safety

- **Database** stores the source of truth for email status.
- **Redis** persists the job queue to disk (AOF mode).
- **Idempotency**: the worker checks the database before sending, so a job that gets retried after a crash won't send the same email twice.
- **BullMQ** retries failed jobs up to 3 times with exponential backoff.

## Rate Limiting

The worker enforces a global hourly send limit (default: 100 emails/hour). It uses a Redis counter keyed by the current hour (`emails:hour:YYYY-MM-DDTHH`). If the limit is exceeded, the job is delayed until the next hour. The counter auto-expires after 3600 seconds.
