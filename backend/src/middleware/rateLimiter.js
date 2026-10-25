
import rateLimit from 'express-rate-limit';

/* Login: 3 attempts per 15 minutes */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
    },
});

/* Registration: 5 attempts per hour */
export const registrationRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many registration attempts. Please try again later.',
    },
});

/* Resend OTP: 3 attempts per 15 minutes */
export const otpRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'You have reached the OTP resend limit. Please try again in 15 minutes.',
    },
});

/* Email verification: 3 attempts per 15 minutes */
export const otpVerificationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many verification attempts. Please try again in 15 minutes.',
    },
});

/* Password reset: 3 attempts per 15 minutes */
export const passwordResetRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset attempts. Please try again in 15 minutes.',
    },
});
