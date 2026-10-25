
import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
];

const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]?.trim()
);

if (missingVariables.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingVariables.join(', ')}. ` +
        'Please configure them in backend/.env.'
    );
}

const portValue = process.env.PORT?.trim() || '5000';
const port = Number(portValue);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535.');
}

export const env = Object.freeze({
    PORT: port,
    MONGODB_URI: process.env.MONGODB_URI.trim(),
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET.trim(),
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET.trim(),
    CLIENT_URL: process.env.CLIENT_URL?.trim() || 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV?.trim() || 'development',
});
