
import { sendError } from '../utils/apiResponse.js';

const allowedSources = new Set(['body', 'params', 'query']);

export function validateRequest(schema, source = 'body') {
    if (!allowedSources.has(source)) {
        throw new Error(
            `Invalid validation source: ${source}. Use body, params, or query.`
        );
    }

    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));

            return sendError(
                res,
                'Please check your input.',
                400,
                errors
            );
        }

        // Store validated values separately so query/params
        // do not need to be reassigned.
        if (!req.validated) {
            req.validated = {};
        }

        req.validated[source] = result.data;

        if (source === 'body') {
            req.body = result.data;
        }

        return next();
    };
}
