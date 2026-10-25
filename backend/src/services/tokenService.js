
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';

import { env } from '../config/environment.js';
import RefreshToken from '../models/RefreshToken.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REMEMBERED_REFRESH_DAYS = 30;
const DEFAULT_REFRESH_DAYS = 1;

const JWT_ISSUER = 'nexora-api';
const JWT_AUDIENCE = 'nexora-client';
const JWT_ALGORITHM = 'HS256';

function hashToken(token) {
    return createHash('sha256')
        .update(token)
        .digest('hex');
}

export function createAccessToken(user) {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
        },
        env.JWT_ACCESS_SECRET,
        {
            algorithm: JWT_ALGORITHM,
            expiresIn: ACCESS_TOKEN_EXPIRY,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
}

export async function createRefreshToken(user, rememberMe = false) {
    const token = randomBytes(48).toString('hex');

    const expiryDays = rememberMe
        ? REMEMBERED_REFRESH_DAYS
        : DEFAULT_REFRESH_DAYS;

    const expiresAt = new Date(
        Date.now() + expiryDays * 24 * 60 * 60 * 1000
    );

    await RefreshToken.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt,
    });

    return { token, expiresAt };
}

export function verifyAccessToken(token) {
    return jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
        {
            algorithms: [JWT_ALGORITHM],
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
        }
    );
}

export async function revokeRefreshToken(token) {
    if (typeof token !== 'string' || !token) {
        return;
    }

    await RefreshToken.updateOne(
        {
            tokenHash: hashToken(token),
            revokedAt: null,
        },
        {
            $set: { revokedAt: new Date() },
        }
    );
}

export async function validateRefreshToken(token) {
    if (typeof token !== 'string' || !token) {
        return null;
    }

    const tokenRecord = await RefreshToken.findOne({
        tokenHash: hashToken(token),
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }).populate({
        path: 'userId',
        select: 'name email role isEmailVerified',
    });

    if (!tokenRecord?.userId) {
        return null;
    }

    return {
        record: tokenRecord,
        user: tokenRecord.userId,
    };
}
