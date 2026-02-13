import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared connection configuration for both BullMQ and IoRedis
// Handles TLS/SSL for production (Rediss protocol) and standard dev
const connectionConfig = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

// Create a new Redis instance for general use
export const redis = new Redis(redisUrl, connectionConfig);

// configuration object for BullMQ
export const bullmqConnection = {
    url: redisUrl,
    ...connectionConfig,
};
