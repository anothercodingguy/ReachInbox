import { Queue, QueueEvents } from 'bullmq';

export interface EmailJobData {
    emailId: string;
    userId: string;
    fromEmail: string;
    toEmail: string;
    subject: string;
    body: string;
    scheduledAt: string;
}

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

// Create the email queue
export const emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: getRedisConfig(),
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: {
            count: 1000, // Keep last 1000 completed jobs
            age: 24 * 60 * 60, // Keep for 24 hours
        },
        removeOnFail: {
            count: 5000, // Keep last 5000 failed jobs
        },
    },
});

// Queue events for monitoring
export const queueEvents = new QueueEvents('email-queue', {
    connection: getRedisConfig(),
});

/**
 * Schedule an email job
 * Uses emailId as jobId for idempotency - prevents duplicate sends
 */
export async function scheduleEmailJob(data: EmailJobData): Promise<string> {
    const scheduledTime = new Date(data.scheduledAt).getTime();
    const now = Date.now();
    const delay = Math.max(0, scheduledTime - now);

    const job = await emailQueue.add('send-email', data, {
        jobId: data.emailId, // Idempotency: same emailId = same job
        delay,
    });

    console.log(`📧 Scheduled email job ${job.id} with delay ${delay}ms`);
    return job.id!;
}

/**
 * Cancel a scheduled email job
 */
export async function cancelEmailJob(emailId: string): Promise<boolean> {
    const job = await emailQueue.getJob(emailId);
    if (job) {
        const state = await job.getState();
        if (state === 'delayed' || state === 'waiting') {
            await job.remove();
            console.log(`🚫 Cancelled email job ${emailId}`);
            return true;
        }
    }
    return false;
}

/**
 * Get job status
 */
export async function getJobStatus(emailId: string) {
    const job = await emailQueue.getJob(emailId);
    if (!job) return null;

    const state = await job.getState();
    return {
        id: job.id,
        state,
        data: job.data,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
    };
}

export default emailQueue;
