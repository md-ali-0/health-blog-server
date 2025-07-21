import { ApiError } from './ApiError';

export class NotFoundError extends ApiError {
    constructor(entity: string, id: string | number) {
        super(404, `${entity} with ID '${id}' not found`, 'NOT_FOUND');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
