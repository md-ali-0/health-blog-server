export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;
    public readonly details?: unknown;

    constructor(
        statusCode: number,
        message: string,
        errorCode: string,
        details?: unknown
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
