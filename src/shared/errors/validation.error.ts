import { BaseError } from './base.error';

export class ValidationError extends BaseError {
  public readonly statusCode = 400;
  public readonly code = 'VALIDATION_ERROR';

  constructor(message: string, validationErrors?: Record<string, unknown>) {
    super(message, { validationErrors });
  }
}
