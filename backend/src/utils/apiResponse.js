
function normalizeStatusCode(statusCode, fallback) {
    return Number.isInteger(statusCode) &&
        statusCode >= 200 &&
        statusCode <= 599
        ? statusCode
        : fallback;
}

export function sendSuccess(
    res,
    message,
    data = {},
    statusCode = 200
) {
    return res
        .status(normalizeStatusCode(statusCode, 200))
        .json({
            success: true,
            message,
            data,
        });
}

export function sendError(
    res,
    message,
    statusCode = 400,
    errors = null
) {
    const response = {
        success: false,
        message,
    };

    if (errors !== null) {
        response.errors = errors;
    }

    return res
        .status(normalizeStatusCode(statusCode, 400))
        .json(response);
}
