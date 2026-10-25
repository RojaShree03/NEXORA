
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
            minlength: [2, 'Name must contain at least 2 characters.'],
            maxlength: [80, 'Name cannot exceed 80 characters.'],
        },

        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
            index: true,
        },

        password: {
            type: String,
            required: [true, 'Password is required.'],
            select: false,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },

        lastLoginAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const User = mongoose.model('User', userSchema);

export default User;
