import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { emailQueue, scheduleEmailJob, cancelEmailJob, getJobStatus } from '../lib/queue.js';
import { EmailStatus, Prisma } from '@prisma/client';
import { createRateLimiter } from '../lib/rateLimiter.js';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const rateLimiter = createRateLimiter(redis);

const router = Router();

// Validation schemas
const createEmailSchema = z.object({
    emails: z.array(z.object({
        toEmail: z.string().email('Invalid email address'),
        subject: z.string().min(1, 'Subject is required'),
        body: z.string().min(1, 'Body is required'),
        scheduledAt: z.string().datetime('Invalid datetime format'),
    })).min(1, 'At least one email is required'),
    fromEmail: z.string().email('Invalid from email address'),
});

const querySchema = z.object({
    status: z.enum(['SCHEDULED', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED']).optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * POST /api/emails - Schedule one or more emails
 */
router.post(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized - User ID required' });
            return;
        }

        // Validate request body
        const validation = createEmailSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                error: 'Validation failed',
                details: validation.error.errors
            });
            return;
        }

        const { emails, fromEmail } = validation.data;

        // Ensure user exists in database
        await prisma.user.upsert({
            where: { id: userId },
            create: {
                id: userId,
                email: fromEmail,
            },
            update: {},
        });

        // Create emails in database and schedule jobs
        const createdEmails = await Promise.all(
            emails.map(async (emailData) => {
                // Create email record
                const email = await prisma.email.create({
                    data: {
                        userId,
                        fromEmail,
                        toEmail: emailData.toEmail,
                        subject: emailData.subject,
                        body: emailData.body,
                        scheduledAt: new Date(emailData.scheduledAt),
                        status: 'SCHEDULED',
                    },
                });

                // Schedule the job with emailId as jobId for idempotency
                await scheduleEmailJob({
                    emailId: email.id,
                    userId,
                    fromEmail,
                    toEmail: email.toEmail,
                    subject: email.subject,
                    body: email.body,
                    scheduledAt: email.scheduledAt.toISOString(),
                });

                return email;
            })
        );

        res.status(201).json({
            message: `Scheduled ${createdEmails.length} email(s)`,
            emails: createdEmails,
        });
    })
);

/**
 * GET /api/emails - List emails with optional filtering
 */
router.get(
    '/',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized - User ID required' });
            return;
        }

        // Validate query params
        const queryValidation = querySchema.safeParse(req.query);
        if (!queryValidation.success) {
            res.status(400).json({
                error: 'Invalid query parameters',
                details: queryValidation.error.errors
            });
            return;
        }

        const { status, page, limit } = queryValidation.data;
        const skip = (page - 1) * limit;

        // Build where clause with proper Prisma typing
        const where: Prisma.EmailWhereInput = { userId };
        if (status) {
            where.status = status as EmailStatus;
        }

        // Get emails with pagination
        const [emails, total] = await Promise.all([
            prisma.email.findMany({
                where,
                orderBy: { scheduledAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.email.count({ where }),
        ]);

        res.json({
            emails,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    })
);

/**
 * GET /api/emails/stats - Get email statistics
 */
router.get(
    '/stats',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized - User ID required' });
            return;
        }

        const [scheduled, processing, sent, failed, cancelled] = await Promise.all([
            prisma.email.count({ where: { userId, status: 'SCHEDULED' } }),
            prisma.email.count({ where: { userId, status: 'PROCESSING' } }),
            prisma.email.count({ where: { userId, status: 'SENT' } }),
            prisma.email.count({ where: { userId, status: 'FAILED' } }),
            prisma.email.count({ where: { userId, status: 'CANCELLED' } }),
        ]);

        res.json({
            scheduled,
            processing,
            sent,
            failed,
            cancelled,
            total: scheduled + processing + sent + failed + cancelled,
        });
    })
);

/**
 * GET /api/emails/limits - Get rate limit status
 */
router.get(
    '/limits',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized - User ID required' });
            return;
        }

        const count = await rateLimiter.getCurrentCount(`user:${userId}`);
        const limit = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100', 10);

        res.json({
            scope: 'user',
            key: userId,
            limit,
            used: count,
            remaining: Math.max(0, limit - count),
            window: '1h'
        });
    })
);

/**
 * GET /api/emails/:id - Get single email details
 */
router.get(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized - User ID required' });
            return;
        }

        const email = await prisma.email.findFirst({
            where: { id: req.params.id, userId },
        });

        if (!email) {
            res.status(404).json({ error: 'Email not found' });
            return;
        }

        // Get job status from queue
        const jobStatus = await getJobStatus(email.id);

        res.json({
            ...email,
            jobStatus,
        });
    })
);

/**
 * DELETE /api/emails/:id - Cancel a scheduled email
 */
router.delete(
    '/:id',
    asyncHandler(async (req: Request, res: Response) => {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized - User ID required' });
            return;
        }

        const email = await prisma.email.findFirst({
            where: { id: req.params.id, userId },
        });

        if (!email) {
            res.status(404).json({ error: 'Email not found' });
            return;
        }

        if (email.status !== 'SCHEDULED') {
            res.status(400).json({
                error: `Cannot cancel email with status: ${email.status}`
            });
            return;
        }

        // Cancel the job in queue
        const cancelled = await cancelEmailJob(email.id);

        // Update database
        await prisma.email.update({
            where: { id: email.id },
            data: { status: 'CANCELLED' },
        });

        res.json({
            message: 'Email cancelled successfully',
            jobCancelled: cancelled,
        });
    })
);

export default router;
