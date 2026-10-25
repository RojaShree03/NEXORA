
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';

import {
    createOtp,
    verifyUserOtp,
    resendUserOtp,
} from './otpService.js';

import {
    createAccessToken,
    createRefreshToken,
    revokeRefreshToken,
} from './tokenService.js';

const SAFE_USER_FIELDS = 'name email role isEmailVerified createdAt';

function normalizeEmail(email) {
    if (typeof email !== 'string' || !email.trim()) {
        throw new Error('A valid email address is required.');
    }

    return email.trim().toLowerCase();
}

export async function registerUser({ name, email, password }) {
    const normalizedEmail = normalizeEmail(email);

    if (typeof name !== 'string' || !name.trim()) {
        throw new Error('Name is required.');
    }

    if (typeof password !== 'string' || !password) {
        throw new Error('Password is required.');
    }

    const existingUser = await User.findOne({
        email: normalizedEmail,
    });

    if (existingUser?.isEmailVerified) {
        throw new Error('An account with this email already exists.');
    }

    // Preserve existing unverified accounts rather than deleting them.
    if (existingUser) {
        await resendUserOtp(existingUser, 'registration');

        return {
            message:
                'Your account is awaiting email verification. A new verification code has been sent.',
            email: existingUser.email,
        };
    }

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: await hashPassword(password),
        isEmailVerified: false,
    });

    await createOtp(user, 'registration');

    return {
        message:
            'Account created. Please verify your email using the OTP sent to you.',
        email: user.email,
    };
}

export async function verifyRegistrationOtp({ email, otp }) {
    const normalizedEmail = normalizeEmail(email);

    if (typeof otp !== 'string' || !otp.trim()) {
        throw new Error('A valid verification code is required.');
    }

    const user = await User.findOne({
        email: normalizedEmail,
    });

    if (!user) {
        throw new Error('Account not found. Please register again.');
    }

    if (user.isEmailVerified) {
        throw new Error('This email address is already verified.');
    }

    await verifyUserOtp(user, otp.trim(), 'registration');

    user.isEmailVerified = true;
    await user.save();

    return {
        message: 'Email verified successfully. You can now sign in.',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}

export async function resendRegistrationOtp(email) {
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
        email: normalizedEmail,
    });

    if (!user) {
        throw new Error('Account not found. Please register again.');
    }

    if (user.isEmailVerified) {
        throw new Error('This email address is already verified.');
    }

    await resendUserOtp(user, 'registration');

    return {
        message: 'A new verification code has been sent.',
    };
}

export async function loginUser({
    email,
    password,
    rememberMe = false,
}) {
    const normalizedEmail = normalizeEmail(email);

    if (typeof password !== 'string' || !password) {
        throw new Error('Invalid email or password.');
    }

    const user = await User.findOne({
        email: normalizedEmail,
    }).select('+password');

    if (
        !user ||
        !(await comparePassword(password, user.password))
    ) {
        throw new Error('Invalid email or password.');
    }

    if (!user.isEmailVerified) {
        throw new Error(
            'Please verify your email before signing in.'
        );
    }

    const accessToken = createAccessToken(user);

    const refresh = await createRefreshToken(user, rememberMe);

    user.lastLoginAt = new Date();
    await user.save();

    return {
        accessToken,
        refreshToken: refresh.token,
        refreshTokenExpiresAt: refresh.expiresAt,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
        },
    };
}

export async function getAuthenticatedUser(userId) {
    const user = await User.findById(userId).select(
        SAFE_USER_FIELDS
    );

    if (!user) {
        throw new Error('User account not found.');
    }

    return user;
}

export async function logoutUser(refreshToken) {
    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }

    return {
        message: 'Signed out successfully.',
    };
}
