import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Redis from 'ioredis';
import { RateLimiter } from '../lib/rateLimiter.js';

describe('RateLimiter', () => {
    let redis: Redis;
    let rateLimiter: RateLimiter;
    const testKey = 'test-user';

    beforeAll(async () => {
        // Use a test Redis instance
        redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: null,
        });

        // Create rate limiter with low limits for testing
        rateLimiter = new RateLimiter(redis, 5, 10000); // 5 requests per 10 seconds
        await rateLimiter.initialize();
    });

    afterAll(async () => {
        await redis.quit();
    });

    beforeEach(async () => {
        // Clean up test keys before each test
        await rateLimiter.reset(testKey);
    });

    describe('checkLimit', () => {
        it('should allow requests under the limit', async () => {
            const result = await rateLimiter.checkLimit(testKey);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4); // 5 - 1 = 4
            expect(result.waitTimeMs).toBe(0);
        });

        it('should track remaining requests correctly', async () => {
            // Make 3 requests
            await rateLimiter.checkLimit(testKey);
            await rateLimiter.checkLimit(testKey);
            const result = await rateLimiter.checkLimit(testKey);

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(2); // 5 - 3 = 2
        });

        it('should deny requests when limit is reached', async () => {
            // Exhaust the limit
            for (let i = 0; i < 5; i++) {
                await rateLimiter.checkLimit(testKey);
            }

            // This should be denied
            const result = await rateLimiter.checkLimit(testKey);

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
            expect(result.waitTimeMs).toBeGreaterThan(0);
        });

        it('should provide correct wait time when rate limited', async () => {
            // Exhaust the limit
            for (let i = 0; i < 5; i++) {
                await rateLimiter.checkLimit(testKey);
            }

            const result = await rateLimiter.checkLimit(testKey);

            // Wait time should be within the window (10 seconds = 10000ms)
            expect(result.waitTimeMs).toBeGreaterThan(0);
            expect(result.waitTimeMs).toBeLessThanOrEqual(10000);
        });
    });

    describe('getCurrentCount', () => {
        it('should return 0 for new key', async () => {
            const count = await rateLimiter.getCurrentCount('new-key');
            expect(count).toBe(0);
        });

        it('should return correct count after requests', async () => {
            await rateLimiter.checkLimit(testKey);
            await rateLimiter.checkLimit(testKey);
            await rateLimiter.checkLimit(testKey);

            const count = await rateLimiter.getCurrentCount(testKey);
            expect(count).toBe(3);
        });
    });

    describe('reset', () => {
        it('should reset the rate limit counter', async () => {
            // Make some requests
            await rateLimiter.checkLimit(testKey);
            await rateLimiter.checkLimit(testKey);

            // Verify count
            let count = await rateLimiter.getCurrentCount(testKey);
            expect(count).toBe(2);

            // Reset
            await rateLimiter.reset(testKey);

            // Verify reset
            count = await rateLimiter.getCurrentCount(testKey);
            expect(count).toBe(0);
        });
    });

    describe('concurrent requests', () => {
        it('should handle concurrent requests atomically', async () => {
            // Make 10 concurrent requests with limit of 5
            const promises = Array(10).fill(null).map(() =>
                rateLimiter.checkLimit(testKey)
            );

            const results = await Promise.all(promises);

            // Exactly 5 should be allowed
            const allowed = results.filter(r => r.allowed).length;
            const denied = results.filter(r => !r.allowed).length;

            expect(allowed).toBe(5);
            expect(denied).toBe(5);
        });
    });

    describe('window expiration', () => {
        it('should allow requests after window expires', async () => {
            // Create a rate limiter with very short window
            const shortWindowLimiter = new RateLimiter(redis, 2, 1000); // 2 requests per 1 second
            await shortWindowLimiter.initialize();
            const shortKey = 'short-window-test';

            // Exhaust limit
            await shortWindowLimiter.checkLimit(shortKey);
            await shortWindowLimiter.checkLimit(shortKey);

            // Should be denied
            let result = await shortWindowLimiter.checkLimit(shortKey);
            expect(result.allowed).toBe(false);

            // Wait for window to expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Should be allowed again
            result = await shortWindowLimiter.checkLimit(shortKey);
            expect(result.allowed).toBe(true);

            // Cleanup
            await shortWindowLimiter.reset(shortKey);
        }, 5000); // Increase timeout for this test
    });
});
