
import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        otpHash: {
            type: String,
            required: true,
            select: false,
        },

        purpose: {
            type: String,
            enum: ['registration', 'password-reset'],
            default: 'registration',
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
            min: 0,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

emailVerificationSchema.index({ userId: 1, purpose: 1 });

const EmailVerification = mongoose.model(
    'EmailVerification',
    emailVerificationSchema
);

export default EmailVerification;
