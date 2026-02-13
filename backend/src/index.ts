import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import emailRoutes from './routes/emails.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = parseInt(process.env.BACKEND_PORT || '4000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
    origin: FRONTEND_URL ? FRONTEND_URL.split(',').map(u => u.trim()) : true,
    credentials: true,
}));
app.use(express.json());

app.use('/api/emails', emailRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const server = app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
});

// Graceful shutdown
const shutdown = async () => {
    console.log('Server shutting down...');
    server.close(async () => {
        console.log('HTTP server closed');
        await prisma.$disconnect();
        console.log('Database disconnected');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
