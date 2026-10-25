
export function sendSuccess(
    res,
    message,
    data = {},
    statusCode = 200
) {
    return res.status(statusCode).json({
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

    return res.status(statusCode).json(response);
}
