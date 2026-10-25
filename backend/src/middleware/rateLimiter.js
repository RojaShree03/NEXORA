
import rateLimit from 'express-rate-limit';

function createRateLimiter(windowMs, limit, message) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,

        message: {
            success: false,
            message,
        },

        handler: (req, res, next, options) => {
            return res.status(options.statusCode).json(options.message);
        },

        // Use the default IP-based key generator.
        // Configure a trusted proxy correctly in Express when deployed.
    });
}

/* Login: 3 attempts per 15 minutes */
export const loginRateLimiter = createRateLimiter(
    15 * 60 * 1000,
    3,
    'Too many login attempts. Please try again in 15 minutes.'
);

/* Registration: 5 attempts per hour */
export const registrationRateLimiter = createRateLimiter(
    60 * 60 * 1000,
    5,
    'Too many registration attempts. Please try again later.'
);

/* Resend OTP: 3 attempts per 15 minutes */
export const otpRateLimiter = createRateLimiter(
    15 * 60 * 1000,
    3,
    'You have reached the OTP resend limit. Please try again in 15 minutes.'
);

/* Email verification: 3 attempts per 15 minutes */
export const otpVerificationRateLimiter = createRateLimiter(
    15 * 60 * 1000,
    3,
    'Too many verification attempts. Please try again in 15 minutes.'
);

/* Password reset: 3 attempts per 15 minutes */
export const passwordResetRateLimiter = createRateLimiter(
    15 * 60 * 1000,
    3,
    'Too many password reset attempts. Please try again in 15 minutes.'
);
