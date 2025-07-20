import { BaseError } from './base.error';

export class NotFoundError extends BaseError {
  public readonly statusCode = 404;
  public readonly code = 'NOT_FOUND';

  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message);
  }
}