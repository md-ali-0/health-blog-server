import { ApiError } from './ApiError';

export class BadRequestError extends ApiError {
    constructor(message: string, details?: unknown) {
        super(400, message, 'BAD_REQUEST', details);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
