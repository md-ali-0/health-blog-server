import { BaseError } from './base.error';

export class AuthError extends BaseError {
  public readonly statusCode = 401;
  public readonly code = 'AUTHENTICATION_ERROR';

  constructor(message = 'Authentication failed') {
    super(message);
  }
}

export class ForbiddenError extends BaseError {
  public readonly statusCode = 403;
  public readonly code = 'FORBIDDEN_ERROR';

  constructor(message = 'Access forbidden') {
    super(message);
  }
}