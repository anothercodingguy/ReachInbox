import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { scheduleEmailJob } from '../lib/queue.js';
import { z } from 'zod';

const router = Router();

const scheduleSchema = z.object({
    recipient: z.string().email(),
    subject: z.string().min(1),
    body: z.string().min(1),
    scheduledAt: z.string().datetime(),
});

// POST / — Schedule an email
router.post('/', async (req, res) => {
    try {
        const { recipient, subject, body, scheduledAt } = scheduleSchema.parse(req.body);

        const email = await prisma.email.create({
            data: {
                recipient,
                subject,
                body,
                scheduledAt: new Date(scheduledAt),
                status: 'SCHEDULED',
            },
        });

        const delay = new Date(scheduledAt).getTime() - Date.now();
        await scheduleEmailJob(email.id, delay);

        res.status(201).json(email);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid request';
        res.status(400).json({ error: message });
    }
});

// GET / — List all emails (newest first)
router.get('/', async (_req, res) => {
    const emails = await prisma.email.findMany({
        orderBy: { createdAt: 'desc' },
    });
    res.json(emails);
});

export default router;
