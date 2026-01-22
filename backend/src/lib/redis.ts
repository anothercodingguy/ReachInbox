import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis connection for general use
export const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
});

// Create a separate connection for subscribers (BullMQ requirement)
export const createRedisConnection = () => {
    return new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });
};

redis.on('connect', () => {
    console.log('✅ Redis connected');
});

redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
});

export default redis;
