import { Queue } from 'bullmq';
import { bullmqConnection } from './redis.js';

export interface EmailJobData {
    emailId: string;
}

export const emailQueue = new Queue<EmailJobData>('email-queue', {
    connection: bullmqConnection,
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


