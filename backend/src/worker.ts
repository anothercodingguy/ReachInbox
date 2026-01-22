import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import 'dotenv/config';
import { EmailJobData } from './lib/queue.js';
import { initializeMailer, sendEmail } from './lib/mailer.js';
import { createRateLimiter, RateLimiter } from './lib/rateLimiter.js';
import prisma from './lib/prisma.js';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
const MIN_DELAY_MS = parseInt(process.env.MIN_DELAY_MS || '1000', 10);
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL for connection config
function getRedisConfig() {
    const url = new URL(redisUrl);
    return {
        host: url.hostname,
        port: parseInt(url.port) || 6379,
        password: url.password || undefined,
        maxRetriesPerRequest: null as null,
    };
}

// Create Redis connection for rate limiter
const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

let rateLimiter: RateLimiter;

/**
 * Process an email job
 */
async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { emailId, fromEmail, toEmail, subject, body, userId } = job.data;

    console.log(`📧 Processing job ${job.id} for email ${emailId}`);

    // Check if email already sent (idempotency check)
    const email = await prisma.email.findUnique({
        where: { id: emailId },
    });

    if (!email) {
        console.log(`⚠️ Email ${emailId} not found in database, skipping`);
        return;
    }

    if (email.status === 'SENT') {
        console.log(`⚠️ Email ${emailId} already sent, skipping`);
        return;
    }

    if (email.status === 'CANCELLED') {
        console.log(`⚠️ Email ${emailId} was cancelled, skipping`);
        return;
    }

    // Check rate limit
    const rateLimitKey = `user:${userId}`;
    const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey);

    if (!rateLimitResult.allowed) {
        console.log(`⏳ Rate limited for user ${userId}, delaying job by ${rateLimitResult.waitTimeMs}ms`);

        // Delay the job instead of failing
        await job.moveToDelayed(Date.now() + rateLimitResult.waitTimeMs, job.token);
        throw new Error(`Rate limited - delaying job by ${rateLimitResult.waitTimeMs}ms`);
    }

    // Update status to processing
    await prisma.email.update({
        where: { id: emailId },
        data: { status: 'PROCESSING' },
    });

    try {
        // Send the email via Ethereal
        const result = await sendEmail({
            from: fromEmail,
            to: toEmail,
            subject: subject,
            html: body,
        });

        if (result.success) {
            // Update database with success
            await prisma.email.update({
                where: { id: emailId },
                data: {
                    status: 'SENT',
                    sentAt: new Date(),
                    etherealUrl: result.etherealUrl,
                },
            });
            console.log(`✅ Email ${emailId} sent successfully`);
        } else {
            throw new Error(result.error || 'Unknown error sending email');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Check if this is the last attempt
        if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
            await prisma.email.update({
                where: { id: emailId },
                data: {
                    status: 'FAILED',
                    errorMessage: errorMessage,
                },
            });
            console.error(`❌ Email ${emailId} failed permanently: ${errorMessage}`);
        } else {
            // Reset to scheduled for retry
            await prisma.email.update({
                where: { id: emailId },
                data: { status: 'SCHEDULED' },
            });
            console.log(`🔄 Email ${emailId} will retry, attempt ${job.attemptsMade + 1}`);
        }

        throw error; // Re-throw to trigger BullMQ retry
    }

    // Enforce minimum delay between sends
    await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS));
}

/**
 * Initialize and start the worker
 */
async function startWorker(): Promise<void> {
    console.log('🚀 Starting email worker...');
    console.log(`📊 Concurrency: ${WORKER_CONCURRENCY}`);
    console.log(`⏱️ Min delay between sends: ${MIN_DELAY_MS}ms`);

    // Initialize mailer
    await initializeMailer();

    // Initialize rate limiter
    rateLimiter = createRateLimiter(redis);
    await rateLimiter.initialize();

    // Create the worker
    const worker = new Worker<EmailJobData>(
        'email-queue',
        processEmailJob,
        {
            connection: getRedisConfig(),
            concurrency: WORKER_CONCURRENCY,
            limiter: {
                max: WORKER_CONCURRENCY,
                duration: MIN_DELAY_MS,
            },
        }
    );

    // Worker event handlers
    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed`);
    });

    worker.on('failed', (job, error) => {
        console.error(`❌ Job ${job?.id} failed:`, error.message);
    });

    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });

    worker.on('ready', () => {
        console.log('✅ Worker is ready and waiting for jobs');
    });

    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🛑 Shutting down worker...');
        await worker.close();
        await redis.quit();
        await prisma.$disconnect();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    console.log('✅ Worker started successfully');
}

startWorker().catch((error) => {
    console.error('Failed to start worker:', error);
    process.exit(1);
});
