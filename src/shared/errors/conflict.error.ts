import { BaseError } from './base.error';

export class ConflictError extends BaseError {
  public readonly statusCode = 409;
  public readonly code = 'CONFLICT_ERROR';

  constructor(message: string) {
    super(message);
  }
}