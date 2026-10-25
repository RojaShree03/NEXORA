
import { sendError } from '../utils/apiResponse.js';

export function validateRequest(schema, source = 'body') {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));

            return sendError(res, 'Please check your input.', 400, errors);
        }

        req[source] = result.data;
        return next();
    };
}
