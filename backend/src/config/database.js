
import mongoose from 'mongoose';
import { env } from './environment.js';

export async function connectDatabase() {
    try {
        const connection = await mongoose.connect(env.MONGODB_URI);

        console.log(
            `MongoDB connected successfully: ${connection.connection.host}`
        );
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        throw error;
    }
}

export async function disconnectDatabase() {
    try {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    } catch (error) {
        console.error('MongoDB disconnection failed:', error.message);
        throw error;
    }
}
