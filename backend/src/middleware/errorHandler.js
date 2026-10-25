
import { sendError } from '../utils/apiResponse.js';

const isProduction = process.env.NODE_ENV === 'production';

export function notFoundHandler(req, res) {
    return sendError(
        res,
        `Route not found: ${req.method} ${req.originalUrl}`,
        404
    );
}

export function errorHandler(error, req, res, next) {
    if (res.headersSent) {
        return next(error);
    }

    // Log useful diagnostic details without exposing them to clients.
    if (isProduction) {
        console.error('API error:', error.message);
    } else {
        console.error('API error:', error.stack || error);
    }

    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors || {}).map(
            (item) => item.message
        );

        return sendError(
            res,
            'Validation failed.',
            400,
            errors
        );
    }

    if (error.code === 11000) {
        return sendError(
            res,
            'An account with this information already exists.',
            409
        );
    }

    if (error.name === 'CastError') {
        return sendError(
            res,
            'Invalid resource identifier.',
            400
        );
    }

    if (error.type === 'entity.parse.failed') {
        return sendError(
            res,
            'Invalid JSON request body.',
            400
        );
    }

    if (error.type === 'entity.too.large') {
        return sendError(
            res,
            'Request body is too large.',
            413
        );
    }

    const candidateStatus = Number(
        error.statusCode ?? error.status
    );

    const statusCode =
        Number.isInteger(candidateStatus) &&
            candidateStatus >= 400 &&
            candidateStatus <= 599
            ? candidateStatus
            : 500;

    // Do not expose unexpected internal server errors.
    const safeMessage =
        statusCode >= 500
            ? 'An unexpected server error occurred.'
            : error.expose === true
                ? error.message
                : statusCode === 401
                    ? 'Authentication required.'
                    : statusCode === 403
                        ? 'Access denied.'
                        : statusCode === 404
                            ? 'Resource not found.'
                            : statusCode === 429
                                ? 'Too many requests. Please try again later.'
                                : 'Request failed.';

    return sendError(
        res,
        safeMessage,
        statusCode
    );
}
