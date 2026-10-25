
import User from '../models/User.js';
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
import {
    createAccessToken,
    createRefreshToken,
    revokeRefreshToken,
} from '../services/tokenService.js';
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

function setAuthCookies(res, accessToken, refreshToken, refreshExpiresAt) {
    res.cookie('accessToken', accessToken, accessCookieOptions);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/api/auth',
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

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/api/auth',
    });
}

function getErrorStatus(message) {
    if (/already exists|already verified/i.test(message)) return 409;
    if (/not found|expired|invalid|verify your email|too many attempts/i.test(message)) {
        return 400;
    }
    return 400;
}

export async function register(req, res, next) {
    try {
        const result = await registerUser(req.body);

        return sendSuccess(res, result.message, { email: result.email }, 201);
    } catch (error) {
        if (error.message?.includes('email')) {
            return sendError(res, error.message, getErrorStatus(error.message));
        }
        return next(error);
    }
}

export async function verifyEmail(req, res, next) {
    try {
        const result = await verifyRegistrationOtp(req.body);

        return sendSuccess(res, result.message, { user: result.user });
    } catch (error) {
        if (error.message) {
            return sendError(res, error.message, getErrorStatus(error.message));
        }
        return next(error);
    }
}

export async function resendOtp(req, res, next) {
    try {
        const result = await resendRegistrationOtp(req.body.email);

        return sendSuccess(res, result.message);
    } catch (error) {
        if (error.message) {
            return sendError(res, error.message, getErrorStatus(error.message));
        }
        return next(error);
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
        if (/invalid email or password/i.test(error.message)) {
            return sendError(res, 'Invalid email or password.', 401);
        }

        if (/verify your email/i.test(error.message)) {
            return sendError(res, error.message, 403);
        }

        return next(error);
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
        if (/not found/i.test(error.message)) {
            return sendError(res, error.message, 404);
        }

        return next(error);
    }
}


/* Update authenticated user's profile */
export async function updateProfile(req, res, next) {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return sendError(res, 'User not found.', 404);
        }

        user.name = req.body.name;
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
        const email = req.body.email.trim().toLowerCase();
        const user = await User.findOne({ email });

        // Return the same response whether the account exists or not.
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
        const email = req.body.email.trim().toLowerCase();
        const { otp, newPassword } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user || !user.isEmailVerified) {
            return sendError(res, 'Invalid or expired reset code.', 400);
        }

        await verifyUserOtp(user, otp, 'password-reset');

        user.password = await hashPassword(newPassword);
        await user.save();

        // Revoke all existing refresh-token sessions for this account.
        const RefreshToken = (await import('../models/RefreshToken.js')).default;
        await RefreshToken.updateMany(
            { userId: user._id, revokedAt: null },
            { $set: { revokedAt: new Date() } }
        );

        return sendSuccess(
            res,
            'Password reset successfully. You can now sign in.'
        );
    } catch (error) {
        if (error.message) {
            return sendError(res, error.message, getErrorStatus(error.message));
        }
        return next(error);
    }
}

