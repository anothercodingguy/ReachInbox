import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { Queue, Worker, Job } from 'bullmq';

describe('Worker Integration', () => {
    let redis: Redis;
    let prisma: PrismaClient;
    let testQueue: Queue;
    let testWorker: Worker;

    const TEST_USER_ID = 'integration-test-user';

    beforeAll(async () => {
        redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
        });

        prisma = new PrismaClient();

        // Create a test queue
        testQueue = new Queue('integration-test-queue', {
            connection: redis,
        });
    });

    afterAll(async () => {
        if (testWorker) {
            await testWorker.close();
        }
        await testQueue.close();
        await redis.quit();
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clean up test data
        await prisma.email.deleteMany({
            where: { userId: TEST_USER_ID },
        });
        await prisma.user.deleteMany({
            where: { id: TEST_USER_ID },
        });
    });

    describe('Job Processing', () => {
        it('should create an email record and enqueue a job', async () => {
            // Create test user
            const user = await prisma.user.create({
                data: {
                    id: TEST_USER_ID,
                    email: 'test@example.com',
                    name: 'Test User',
                },
            });

            // Create email record
            const email = await prisma.email.create({
                data: {
                    userId: user.id,
                    fromEmail: 'sender@example.com',
                    toEmail: 'recipient@example.com',
                    subject: 'Test Email',
                    body: '<p>This is a test email</p>',
                    scheduledAt: new Date(Date.now() + 60000), // 1 minute from now
                    status: 'SCHEDULED',
                },
            });

            expect(email.id).toBeDefined();
            expect(email.status).toBe('SCHEDULED');

            // Verify we can query the email
            const foundEmail = await prisma.email.findUnique({
                where: { id: email.id },
            });

            expect(foundEmail).not.toBeNull();
            expect(foundEmail?.toEmail).toBe('recipient@example.com');
        });

        it('should process a job and update database status', async () => {
            // Create test user
            const user = await prisma.user.create({
                data: {
                    id: TEST_USER_ID,
                    email: 'test@example.com',
                    name: 'Test User',
                },
            });

            // Create email record
            const email = await prisma.email.create({
                data: {
                    userId: user.id,
                    fromEmail: 'sender@example.com',
                    toEmail: 'recipient@example.com',
                    subject: 'Test Email',
                    body: '<p>This is a test email</p>',
                    scheduledAt: new Date(),
                    status: 'SCHEDULED',
                },
            });

            // Create a test worker that simulates email sending
            let jobProcessed = false;

            testWorker = new Worker(
                'integration-test-queue',
                async (job: Job) => {
                    const { emailId } = job.data;

                    // Simulate processing
                    await prisma.email.update({
                        where: { id: emailId },
                        data: {
                            status: 'SENT',
                            sentAt: new Date(),
                            etherealUrl: 'https://ethereal.email/message/test123',
                        },
                    });

                    jobProcessed = true;
                    return { success: true };
                },
                { connection: redis }
            );

            // Add job to queue
            await testQueue.add('send-email', {
                emailId: email.id,
                userId: user.id,
                fromEmail: email.fromEmail,
                toEmail: email.toEmail,
                subject: email.subject,
                body: email.body,
            });

            // Wait for job to be processed
            await new Promise(resolve => setTimeout(resolve, 2000));

            expect(jobProcessed).toBe(true);

            // Verify database was updated
            const updatedEmail = await prisma.email.findUnique({
                where: { id: email.id },
            });

            expect(updatedEmail?.status).toBe('SENT');
            expect(updatedEmail?.sentAt).not.toBeNull();
            expect(updatedEmail?.etherealUrl).toBe('https://ethereal.email/message/test123');
        }, 10000);

        it('should not resend already sent emails (idempotency)', async () => {
            // Create test user
            const user = await prisma.user.create({
                data: {
                    id: TEST_USER_ID,
                    email: 'test@example.com',
                    name: 'Test User',
                },
            });

            // Create email record that's already sent
            const email = await prisma.email.create({
                data: {
                    userId: user.id,
                    fromEmail: 'sender@example.com',
                    toEmail: 'recipient@example.com',
                    subject: 'Already Sent Email',
                    body: '<p>This email was already sent</p>',
                    scheduledAt: new Date(),
                    status: 'SENT',
                    sentAt: new Date(),
                    etherealUrl: 'https://ethereal.email/original',
                },
            });

            let processCount = 0;

            testWorker = new Worker(
                'integration-test-queue',
                async (job: Job) => {
                    const { emailId } = job.data;

                    // Check if already sent
                    const existingEmail = await prisma.email.findUnique({
                        where: { id: emailId },
                    });

                    if (existingEmail?.status === 'SENT') {
                        // Skip - already sent
                        return { skipped: true };
                    }

                    processCount++;
                    return { success: true };
                },
                { connection: redis }
            );

            // Try to process the same email multiple times
            await testQueue.add('send-email', { emailId: email.id }, { jobId: email.id });

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Should have been skipped, not processed
            expect(processCount).toBe(0);

            // Email should still have original ethereal URL
            const unchangedEmail = await prisma.email.findUnique({
                where: { id: email.id },
            });
            expect(unchangedEmail?.etherealUrl).toBe('https://ethereal.email/original');
        }, 10000);
    });

    describe('Queue Persistence', () => {
        it('should persist jobs in Redis', async () => {
            const jobId = `test-job-${Date.now()}`;

            // Add a delayed job
            await testQueue.add(
                'send-email',
                { emailId: 'test-123', userId: 'user-123' },
                {
                    jobId,
                    delay: 60000, // 1 minute delay
                }
            );

            // Get the job from queue
            const job = await testQueue.getJob(jobId);

            expect(job).not.toBeNull();
            expect(job?.data.emailId).toBe('test-123');

            // Clean up
            if (job) {
                await job.remove();
            }
        });
    });
});
