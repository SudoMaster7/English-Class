import rateLimit from 'express-rate-limit';

// General API rate limiter
export const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth routes (prevent brute force)
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login/register attempts per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again in 15 minutes'
    },
    skipSuccessfulRequests: true // Don't count successful requests
});

// AI API rate limiter (more restrictive due to cost)
export const aiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit to 20 AI requests per hour
    message: {
        success: false,
        message: 'AI request limit reached. Please try again later or upgrade to premium for unlimited access.',
        upgradeRequired: true
    }
});

// Translation API rate limiter
export const translationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 translations per hour for free users
    message: {
        success: false,
        message: 'Translation limit reached. Upgrade to premium for unlimited translations.',
        upgradeRequired: true
    },
    skip: (req) => {
        // Skip rate limit for premium users
        return req.user && (req.user.tier === 'premium' || req.user.tier === 'enterprise');
    }
});
