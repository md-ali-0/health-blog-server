import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../../shared/errors/base.error';
import { container } from '../../config/container';
import { ILogger } from '../../shared/interfaces/logger.interface';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger = container.get<ILogger>('ILogger');
  const requestLogger = logger.child({ requestId: req.id });

  if (error instanceof BaseError) {
    requestLogger.warn('Operational error', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });

    res.status(error.statusCode).json(error.toJSON());
    return;
  }

  // Unexpected errors
  requestLogger.error('Unexpected error', error);

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: {},
  });
}