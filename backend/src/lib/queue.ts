import { Queue } from 'bullmq';

export interface EmailJobData {
    emailId: string;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redisConnection: any = {
    url: redisUrl,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

export const emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: redisConnection,
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


