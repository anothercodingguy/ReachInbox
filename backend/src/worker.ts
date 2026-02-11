import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import 'dotenv/config';
import { EmailJobData } from './lib/queue.js';
import { initializeMailer, sendEmail } from './lib/mailer.js';
import prisma from './lib/prisma.js';

const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '1', 10);
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const RATE_LIMIT_PER_HOUR = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100', 10);

const redisConfig = {
    host: new URL(redisUrl).hostname,
    port: parseInt(new URL(redisUrl).port || '6379'),
    maxRetriesPerRequest: null,
};

const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });

async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
    const { emailId } = job.data;

    const email = await prisma.email.findUnique({ where: { id: emailId } });

    if (!email || email.status === 'SENT' || email.status === 'FAILED') {
        return;
    }

    // Global hourly rate limiting
    const now = new Date();
    const hourKey = `emails:hour:${now.toISOString().slice(0, 13)}`;
    const currentCount = await redis.incr(hourKey);
    if (currentCount === 1) {
        await redis.expire(hourKey, 3600);
    }

    if (currentCount > RATE_LIMIT_PER_HOUR) {
        const delayMs = 60 * 60 * 1000 - (now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000);
        await job.moveToDelayed(Date.now() + Math.max(delayMs, 1000), job.token);
        return;
    }

    try {
        const result = await sendEmail({
            from: 'noreply@reachinbox.ai',
            to: email.recipient,
            subject: email.subject,
            html: email.body,
        });

        if (result.success) {
            await prisma.email.update({
                where: { id: emailId },
                data: { status: 'SENT', sentAt: new Date() },
            });
        } else {
            throw new Error(result.error);
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to send email ${emailId}: ${message}`);
        await prisma.email.update({
            where: { id: emailId },
            data: { status: 'FAILED', error: message },
        });
    }
}

async function startWorker() {
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
    console.log('Worker started');
}

startWorker().catch(console.error);
