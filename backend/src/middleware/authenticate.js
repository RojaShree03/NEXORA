
import { verifyAccessToken } from '../services/tokenService.js';
import { sendError } from '../utils/apiResponse.js';

export function authenticate(req, res, next) {
    const token = req.cookies?.accessToken;

    if (!token) {
        return sendError(res, 'Authentication required. Please sign in.', 401);
    }

    try {
        const payload = verifyAccessToken(token);

        if (!payload.sub) {
            return sendError(res, 'Invalid authentication token.', 401);
        }

        req.user = {
            id: payload.sub,
            role: payload.role,
        };

        return next();
    } catch {
        return sendError(
            res,
            'Your session has expired. Please sign in again.',
            401
        );
    }
}
