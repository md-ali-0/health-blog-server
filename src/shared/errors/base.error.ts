export abstract class BaseError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): Record<string, unknown> {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}