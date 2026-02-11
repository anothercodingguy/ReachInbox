import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import 'dotenv/config';
import { EmailJobData } from './lib/queue.js';
import { initializeMailer, sendEmail } from './lib/mailer.js';
import prisma from './lib/prisma.js';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '1', 10);
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const RATE_LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100', 10);

// Create Redis connection
const redisConfig = {
    host: new URL(redisUrl).hostname,
    port: parseInt(new URL(redisUrl).port || '6379'),
    maxRetriesPerRequest: null,
};

// Create Redis connection for direct usage (rate limiting)
const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });

/**
 * Process an email job
 */
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { emailId } = job.data;
    console.log(`Processing email ${emailId}`);

    // 1. Fetch email
    const email = await prisma.email.findUnique({ where: { id: emailId } });

    // 2. Idempotency & Status Checks
    if (!email || email.status === 'SENT' || email.status === 'FAILED') {
        return; // Already done or invalid
    }

    // 3. Global Rate Limiting
    const now = new Date();
    const hourKey = `emails:hour:${now.toISOString().slice(0, 13)}`; // YYYY-MM-DDTHH
    const currentCount = await redis.incr(hourKey);
    if (currentCount === 1) {
        await redis.expire(hourKey, 3600); // Expires in 1 hour
    }

    if (currentCount > RATE_LIMIT_PER_HOUR) {
        console.log(`Rate limit exceeded (${currentCount}/${RATE_LIMIT_PER_HOUR}). Delaying job.`);
        const delayMs = 60 * 60 * 1000 - (now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000); // Until next hour roughly
        await job.moveToDelayed(Date.now() + Math.max(delayMs, 1000), job.token); // Retry next hour
        return;
    }

    // 4. Send Email
    try {
        const result = await sendEmail({
            from: 'noreply@reachinbox.ai', // Default simplified sender
            to: email.recipient,
            subject: email.subject,
            html: email.body,
        });

        if (result.success) {
            await prisma.email.update({
                where: { id: emailId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                },
            });
            console.log(`Sent email ${emailId}`);
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        console.error(`Failed to send email ${emailId}:`, error);
        await prisma.email.update({
            where: { id: emailId },
            data: {
                status: 'FAILED',
                error: error.message,
            },
        });
    }
}

async function startWorker() {
    console.log('Starting worker...');
    await initializeMailer();

    const worker = new Worker<EmailJobData>(
        'email-queue',
        processEmailJob,
        {
            connection: redisConfig,
            concurrency: WORKER_CONCURRENCY,
        }
    );

    worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed: ${err.message}`));
    console.log('Worker started.');
}

startWorker().catch(console.error);
