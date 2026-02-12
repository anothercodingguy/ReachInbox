import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import emailRoutes from './routes/emails.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(cors({
    origin: FRONTEND_URL ? FRONTEND_URL.split(',').map(u => u.trim()) : true,
    credentials: true,
}));
app.use(express.json());

app.use('/api/emails', emailRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
});
