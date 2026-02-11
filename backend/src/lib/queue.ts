import { Queue } from 'bullmq';

export interface EmailJobData {
    emailId: string;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisConfig = {
    host: new URL(redisUrl).hostname,
    port: parseInt(new URL(redisUrl).port || '6379'),
    maxRetriesPerRequest: null,
};

export const emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: 1000,
    },
});

export async function scheduleEmailJob(emailId: string, delay: number) {
    await emailQueue.add('send-email', { emailId }, {
        jobId: emailId,
        delay,
    });
}
