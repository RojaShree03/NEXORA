
import User from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { createOtp, verifyUserOtp, resendUserOtp } from './otpService.js';
import {
    createAccessToken,
    createRefreshToken,
    revokeRefreshToken,
} from './tokenService.js';

const SAFE_USER_FIELDS = 'name email role isEmailVerified createdAt';

export async function registerUser({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser?.isEmailVerified) {
        throw new Error('An account with this email already exists.');
    }

    if (existingUser) {
        await User.deleteOne({ _id: existingUser._id });
    }

    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: await hashPassword(password),
        isEmailVerified: false,
    });

    await createOtp(user, 'registration');

    return {
        message: 'Account created. Please verify your email using the OTP sent to you.',
        email: user.email,
    };
}

export async function verifyRegistrationOtp({ email, otp }) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('Account not found. Please register again.');
    }

    if (user.isEmailVerified) {
        throw new Error('This email address is already verified.');
    }

    await verifyUserOtp(user, otp, 'registration');

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
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('Account not found. Please register again.');
    }

    if (user.isEmailVerified) {
        throw new Error('This email address is already verified.');
    }

    await resendUserOtp(user, 'registration');

    return { message: 'A new verification code has been sent.' };
}

export async function loginUser({ email, password, rememberMe = false }) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail })
        .select('+password');

    if (!user || !(await comparePassword(password, user.password))) {
        throw new Error('Invalid email or password.');
    }

    if (!user.isEmailVerified) {
        throw new Error('Please verify your email before signing in.');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = createAccessToken(user);
    const refresh = await createRefreshToken(user, rememberMe);

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
    const user = await User.findById(userId).select(SAFE_USER_FIELDS);

    if (!user) {
        throw new Error('User account not found.');
    }

    return user;
}

export async function logoutUser(refreshToken) {
    await revokeRefreshToken(refreshToken);
    return { message: 'Signed out successfully.' };
}
