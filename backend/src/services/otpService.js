
import EmailVerification from '../models/EmailVerification.js';

import {
    generateOtp,
    hashOtp,
    verifyOtpHash,
} from '../utils/otp.js';

import {
    sendVerificationEmail,
    sendPasswordResetEmail,
} from './emailService.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const VALID_PURPOSES = new Set([
    'registration',
    'password-reset',
]);

export async function createOtp(user, purpose = 'registration') {
    if (!user?._id || !user.email) {
        throw new Error('A valid user is required to create an OTP.');
    }

    if (!VALID_PURPOSES.has(purpose)) {
        throw new Error('Invalid OTP purpose.');
    }

    const otp = generateOtp();

    const expiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    const record = await EmailVerification.create({
        userId: user._id,
        email: user.email,
        otpHash: hashOtp(otp),
        purpose,
        expiresAt,
        attempts: 0,
    });

    try {
        if (purpose === 'password-reset') {
            await sendPasswordResetEmail(user.email, otp);
        } else {
            await sendVerificationEmail(user.email, otp);
        }
    } catch (error) {
        console.error(
            'OTP email delivery failed:',
            error?.message || error
        );

        await EmailVerification.deleteOne({ _id: record._id });

        throw new Error(
            'Unable to send the email. Please try again later.'
        );
    }

    // Only after delivery succeeds, invalidate other OTPs for this purpose.
    await EmailVerification.deleteMany({
        userId: user._id,
        purpose,
        _id: { $ne: record._id },
    });

    return {
        expiresInMinutes: OTP_EXPIRY_MINUTES,
    };
}

export async function verifyUserOtp(
    user,
    otp,
    purpose = 'registration'
) {
    if (!user?._id || !VALID_PURPOSES.has(purpose)) {
        throw new Error('Invalid OTP verification request.');
    }

    if (typeof otp !== 'string' || !otp.trim()) {
        throw new Error('A valid OTP is required.');
    }

    const record = await EmailVerification.findOne({
        userId: user._id,
        purpose,
    }).select('+otpHash');

    if (!record) {
        throw new Error(
            'OTP not found. Please request a new code.'
        );
    }

    if (record.expiresAt.getTime() <= Date.now()) {
        await record.deleteOne();

        throw new Error(
            'OTP has expired. Please request a new code.'
        );
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
        await record.deleteOne();

        throw new Error(
            'Too many attempts. Please request a new OTP.'
        );
    }

    const valid = verifyOtpHash(otp.trim(), record.otpHash);

    if (!valid) {
        record.attempts += 1;
        await record.save();

        throw new Error(
            record.attempts >= MAX_OTP_ATTEMPTS
                ? 'Too many attempts. Please request a new OTP.'
                : 'Invalid OTP. Please try again.'
        );
    }

    await record.deleteOne();

    return true;
}

export async function resendUserOtp(
    user,
    purpose = 'registration'
) {
    return createOtp(user, purpose);
}
