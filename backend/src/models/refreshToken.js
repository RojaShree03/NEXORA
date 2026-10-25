
import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },

        revokedAt: {
            type: Date,
            default: null,
        },

        replacedByTokenHash: {
            type: String,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

const RefreshToken = mongoose.model(
    'RefreshToken',
    refreshTokenSchema
);

export default RefreshToken;
