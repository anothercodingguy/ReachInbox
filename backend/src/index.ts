import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import emailRoutes from './routes/emails.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

app.use(cors()); // Allow all
app.use(express.json());

// Routes
app.use('/api/emails', emailRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    try {
        await prisma.$connect();
        console.log('✅ DB Connected');
    } catch (err) {
        console.error('❌ DB Connection failed:', err);
    }
});
