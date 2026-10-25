
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

export async function createOtp(user, purpose = 'registration') {
    const otp = generateOtp();

    const expiresAt = new Date(
        Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    await EmailVerification.deleteMany({
        userId: user._id,
        purpose,
    });

    await EmailVerification.create({
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
        // Log the actual error for debugging. Never log passwords or OTPs.
        console.error(
            'OTP email delivery failed:',
            error?.message || error
        );

        await EmailVerification.deleteMany({
            userId: user._id,
            purpose,
        });

        throw new Error(
            'Unable to send the email. Please try again later.'
        );
    }

    return {
        expiresInMinutes: OTP_EXPIRY_MINUTES,
    };
}

export async function verifyUserOtp(
    user,
    otp,
    purpose = 'registration'
) {
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

    const valid = verifyOtpHash(otp, record.otpHash);

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
