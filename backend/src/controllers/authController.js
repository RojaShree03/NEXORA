
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

import {
    registerUser,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    loginUser,
    getAuthenticatedUser,
    logoutUser,
} from '../services/authService.js';

import {
    createOtp,
    verifyUserOtp,
} from '../services/otpService.js';

import { hashPassword } from '../utils/password.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const isProduction = process.env.NODE_ENV === 'production';

const accessCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth',
};

function setAuthCookies(res, accessToken, refreshToken, refreshExpiresAt) {
    res.cookie('accessToken', accessToken, accessCookieOptions);

    res.cookie('refreshToken', refreshToken, {
        ...refreshCookieOptions,
        expires: refreshExpiresAt,
    });
}

function clearAuthCookies(res) {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
    });

    res.clearCookie('refreshToken', refreshCookieOptions);
}

function getErrorStatus(message = '') {
    if (/already exists|already verified/i.test(message)) {
        return 409;
    }

    if (/not found/i.test(message)) {
        return 404;
    }

    if (/too many attempts/i.test(message)) {
        return 429;
    }

    if (/verify your email/i.test(message)) {
        return 403;
    }

    if (/invalid|expired|required|email|password/i.test(message)) {
        return 400;
    }

    return 400;
}

function getNormalizedEmail(req, res) {
    const email = req.body?.email;

    if (typeof email !== 'string' || !email.trim()) {
        sendError(res, 'Valid email is required.', 400);
        return null;
    }

    return email.trim().toLowerCase();
}

function handleKnownError(error, res, next) {
    if (
        error?.statusCode &&
        Number.isInteger(error.statusCode) &&
        error.statusCode >= 400 &&
        error.statusCode < 500
    ) {
        return sendError(res, error.message, error.statusCode);
    }

    // Handle known service validation errors.
    if (error?.message && error.statusCode === undefined) {
        return sendError(
            res,
            error.message,
            getErrorStatus(error.message)
        );
    }

    return next(error);
}

export async function register(req, res, next) {
    try {
        const result = await registerUser(req.body);

        return sendSuccess(
            res,
            result.message,
            { email: result.email },
            201
        );
    } catch (error) {
        return handleKnownError(error, res, next);
    }
}

export async function verifyEmail(req, res, next) {
    try {
        const result = await verifyRegistrationOtp(req.body);

        return sendSuccess(res, result.message, {
            user: result.user,
        });
    } catch (error) {
        return handleKnownError(error, res, next);
    }
}

export async function resendOtp(req, res, next) {
    try {
        const email = getNormalizedEmail(req, res);

        if (!email) return;

        const result = await resendRegistrationOtp(email);

        return sendSuccess(res, result.message);
    } catch (error) {
        return handleKnownError(error, res, next);
    }
}

export async function login(req, res, next) {
    try {
        const result = await loginUser(req.body);

        setAuthCookies(
            res,
            result.accessToken,
            result.refreshToken,
            result.refreshTokenExpiresAt
        );

        return sendSuccess(res, 'Signed in successfully.', {
            user: result.user,
        });
    } catch (error) {
        if (/invalid email or password/i.test(error.message || '')) {
            return sendError(res, 'Invalid email or password.', 401);
        }

        if (/verify your email/i.test(error.message || '')) {
            return sendError(res, error.message, 403);
        }

        return handleKnownError(error, res, next);
    }
}

export async function logout(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        await logoutUser(refreshToken);

        clearAuthCookies(res);

        return sendSuccess(res, 'Signed out successfully.');
    } catch (error) {
        return next(error);
    }
}

export async function getMe(req, res, next) {
    try {
        if (!req.user?.id) {
            return sendError(res, 'Authentication required.', 401);
        }

        const user = await getAuthenticatedUser(req.user.id);

        return sendSuccess(res, 'Authenticated user loaded.', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        if (/not found/i.test(error.message || '')) {
            return sendError(res, 'User not found.', 404);
        }

        return next(error);
    }
}

/* Update authenticated user's profile */
export async function updateProfile(req, res, next) {
    try {
        if (!req.user?.id) {
            return sendError(res, 'Authentication required.', 401);
        }

        const name = req.body?.name;

        if (typeof name !== 'string' || !name.trim()) {
            return sendError(res, 'Name is required.', 400);
        }

        const normalizedName = name.trim();

        if (normalizedName.length > 100) {
            return sendError(
                res,
                'Name must not exceed 100 characters.',
                400
            );
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        user.name = normalizedName;
        await user.save();

        return sendSuccess(res, 'Profile updated successfully.', {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        });
    } catch (error) {
        return next(error);
    }
}

export async function forgotPassword(req, res, next) {
    try {
        const email = getNormalizedEmail(req, res);

        if (!email) return;

        const user = await User.findOne({ email });

        // Avoid revealing whether an account exists.
        if (user && user.isEmailVerified) {
            await createOtp(user, 'password-reset');
        }

        return sendSuccess(
            res,
            'If an account exists for this email, password reset instructions will be sent.'
        );
    } catch (error) {
        return next(error);
    }
}

export async function resetPassword(req, res, next) {
    try {
        const email = getNormalizedEmail(req, res);

        if (!email) return;

        const { otp, newPassword } = req.body ?? {};

        if (typeof otp !== 'string' || !otp.trim()) {
            return sendError(res, 'Reset code is required.', 400);
        }

        if (
            typeof newPassword !== 'string' ||
            newPassword.length < 8
        ) {
            return sendError(
                res,
                'New password must be at least 8 characters long.',
                400
            );
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !user.isEmailVerified) {
            return sendError(res, 'Invalid or expired reset code.', 400);
        }

        await verifyUserOtp(user, otp.trim(), 'password-reset');

        user.password = await hashPassword(newPassword);
        await user.save();

        // Revoke existing refresh-token sessions after a password reset.
        await RefreshToken.updateMany(
            { userId: user._id, revokedAt: null },
            { $set: { revokedAt: new Date() } }
        );

        return sendSuccess(
            res,
            'Password reset successfully. You can now sign in.'
        );
    } catch (error) {
        return handleKnownError(error, res, next);
    }
}
