
import { sendError } from '../utils/apiResponse.js';

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

    console.error('API error:', error.message);

    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map((item) => item.message);

        return sendError(res, 'Validation failed.', 400, errors);
    }

    if (error.code === 11000) {
        return sendError(
            res,
            'An account with this information already exists.',
            409
        );
    }

    if (error.name === 'CastError') {
        return sendError(res, 'Invalid resource identifier.', 400);
    }

    if (error.type === 'entity.parse.failed') {
        return sendError(res, 'Invalid JSON request body.', 400);
    }

    const statusCode = Number(error.statusCode) || Number(error.status) || 500;

    const safeMessage =
        statusCode >= 500
            ? 'An unexpected server error occurred.'
            : error.message || 'Request failed.';

    return sendError(res, safeMessage, statusCode);
}
