import Redis from 'ioredis';

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets
 * 
 * This implementation uses a Lua script for atomic operations to prevent race conditions.
 * Jobs are NEVER dropped - when rate limited, they are delayed until the next available slot.
 */

// Lua script for atomic rate limit check and increment
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove old entries outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- Count current requests in window
local count = redis.call('ZCARD', key)

if count < limit then
  -- Add current request with unique member (timestamp + random suffix)
  local member = now .. '-' .. math.random(1000000)
  redis.call('ZADD', key, now, member)
  redis.call('EXPIRE', key, math.ceil(window / 1000))
  return {1, limit - count - 1, 0}  -- {allowed, remaining, waitTime}
else
  -- Get oldest entry to calculate wait time
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  if oldest and #oldest >= 2 then
    local oldestTime = tonumber(oldest[2])
    local waitTime = math.ceil((oldestTime + window - now))
    return {0, 0, waitTime}  -- {denied, remaining, waitTime in ms}
  else
    return {0, 0, window}  -- fallback wait time
  end
end
`;

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    waitTimeMs: number;
}

export class RateLimiter {
    private redis: Redis;
    private limit: number;
    private windowMs: number;
    private scriptSha: string | null = null;

    constructor(redis: Redis, limit: number, windowMs: number = 3600000) {
        this.redis = redis;
        this.limit = limit;
        this.windowMs = windowMs;
    }

    /**
     * Initialize the rate limiter by loading the Lua script
     */
    async initialize(): Promise<void> {
        this.scriptSha = await this.redis.script('LOAD', RATE_LIMIT_SCRIPT) as string;
        console.log(`✅ Rate limiter initialized: ${this.limit} requests per ${this.windowMs}ms`);
    }

    /**
     * Check if the request is allowed under the rate limit
     * @param key - Unique key for rate limiting (e.g., userId, senderId)
     */
    async checkLimit(key: string): Promise<RateLimitResult> {
        const redisKey = `ratelimit:${key}`;
        const now = Date.now();

        try {
            let result: [number, number, number];

            if (this.scriptSha) {
                // Use cached script
                result = await this.redis.evalsha(
                    this.scriptSha,
                    1,
                    redisKey,
                    this.limit.toString(),
                    this.windowMs.toString(),
                    now.toString()
                ) as [number, number, number];
            } else {
                // Fallback to eval
                result = await this.redis.eval(
                    RATE_LIMIT_SCRIPT,
                    1,
                    redisKey,
                    this.limit.toString(),
                    this.windowMs.toString(),
                    now.toString()
                ) as [number, number, number];
            }

            return {
                allowed: result[0] === 1,
                remaining: result[1],
                waitTimeMs: result[2],
            };
        } catch (error) {
            console.error('Rate limit check failed:', error);
            // On error, allow the request (fail open)
            return { allowed: true, remaining: 0, waitTimeMs: 0 };
        }
    }

    /**
     * Get current count for a key
     */
    async getCurrentCount(key: string): Promise<number> {
        const redisKey = `ratelimit:${key}`;
        const now = Date.now();
        const windowStart = now - this.windowMs;

        // Remove expired entries and count
        await this.redis.zremrangebyscore(redisKey, 0, windowStart);
        return await this.redis.zcard(redisKey);
    }

    /**
     * Reset the rate limit for a key
     */
    async reset(key: string): Promise<void> {
        const redisKey = `ratelimit:${key}`;
        await this.redis.del(redisKey);
    }
}

// Factory function for creating rate limiters
export function createRateLimiter(redis: Redis): RateLimiter {
    const limit = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100', 10);
    const windowMs = 60 * 60 * 1000; // 1 hour in milliseconds
    return new RateLimiter(redis, limit, windowMs);
}

export default RateLimiter;
