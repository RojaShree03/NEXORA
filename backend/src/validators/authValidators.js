
import { z } from 'zod';

/* Email validation */
const emailSchema = z
    .string()
    .trim()
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.')
    .transform((email) => email.toLowerCase());

/* Strong password validation */
const passwordSchema = z
    .string()
    .min(8, 'Password must contain at least 8 characters.')
    .max(72, 'Password cannot exceed 72 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter (A-Z).')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter (a-z).')
    .regex(/\d/, 'Password must contain at least one number (0-9).')
    .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special symbol (@, #, !, etc.).'
    );

/* Registration validation */
export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Name must contain at least 2 characters.')
        .max(80, 'Name cannot exceed 80 characters.'),

    email: emailSchema,
    password: passwordSchema,
}).strict();

/* Login validation */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required.').max(72),
    rememberMe: z.boolean().optional().default(false),
}).strict();

/* Email OTP verification */
export const verifyEmailSchema = z.object({
    email: emailSchema,
    otp: z.string().regex(/^\d{6}$/, 'OTP must contain exactly 6 digits.'),
}).strict();

/* Resend OTP validation */
export const resendOtpSchema = z.object({
    email: emailSchema,
}).strict();

/* Forgot password validation */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
}).strict();

/* Reset password validation */
export const resetPasswordSchema = z.object({
    email: emailSchema,
    otp: z.string().regex(/^\d{6}$/, 'OTP must contain exactly 6 digits.'),
    newPassword: passwordSchema,
}).strict();

/* Update profile validation */
export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Name must contain at least 2 characters.')
        .max(80, 'Name cannot exceed 80 characters.'),
}).strict();
