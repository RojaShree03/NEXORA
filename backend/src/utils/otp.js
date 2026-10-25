
import { randomInt, randomBytes, createHash, timingSafeEqual } from 'node:crypto';

export function generateOtp() {
    return randomInt(100000, 1000000).toString();
}

export function generateSecureToken() {
    return randomBytes(32).toString('hex');
}

export function hashOtp(otp) {
    return createHash('sha256').update(String(otp)).digest('hex');
}

export function verifyOtpHash(otp, storedHash) {
    if (
        typeof otp !== 'string' ||
        typeof storedHash !== 'string' ||
        !/^\d{6}$/.test(otp) ||
        !/^[a-f0-9]{64}$/i.test(storedHash)
    ) {
        return false;
    }

    const candidateHash = Buffer.from(hashOtp(otp), 'hex');
    const expectedHash = Buffer.from(storedHash, 'hex');

    return (
        candidateHash.length === expectedHash.length &&
        timingSafeEqual(candidateHash, expectedHash)
    );
}
