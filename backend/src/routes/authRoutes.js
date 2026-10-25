
import { Router } from 'express';

import {
    register,
    verifyEmail,
    resendOtp,
    login,
    logout,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
} from '../controllers/authController.js';

import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validateRequest.js';

import {
    registerSchema,
    verifyEmailSchema,
    resendOtpSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema
} from '../validators/authValidators.js';

import {
    loginRateLimiter,
    registrationRateLimiter,
    otpRateLimiter,
    otpVerificationRateLimiter,
    passwordResetRateLimiter,
} from '../middleware/rateLimiter.js';

const router = Router();

/* Register account */
router.post(
    '/register',
    registrationRateLimiter,
    validateRequest(registerSchema),
    register
);

/* Verify email OTP */
router.post(
    '/verify-email',
    otpVerificationRateLimiter,
    validateRequest(verifyEmailSchema),
    verifyEmail
);

/* Resend OTP */
router.post(
    '/resend-otp',
    otpRateLimiter,
    validateRequest(resendOtpSchema),
    resendOtp
);

/* Login */
router.post(
    '/login',
    loginRateLimiter,
    validateRequest(loginSchema),
    login
);

/* Logout */
router.post('/logout', logout);

/* Get authenticated user */
router.get('/me', authenticate, getMe);

/* Update authenticated user's profile */
router.patch(
    '/profile',
    authenticate,
    validateRequest(updateProfileSchema),
    updateProfile
);

/* Forgot password */
router.post(
    '/forgot-password',
    passwordResetRateLimiter,
    validateRequest(forgotPasswordSchema),
    forgotPassword
);

/* Reset password */
router.post(
    '/reset-password',
    passwordResetRateLimiter,
    validateRequest(resetPasswordSchema),
    resetPassword
);

export default router;
