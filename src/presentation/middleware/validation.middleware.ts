import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../../shared/errors/validation.error';
import { SanitizerUtil } from '../../shared/utils/sanitizer.util';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body before validation
      const sanitizedBody = sanitizeRequestBody(req.body);
      
      // Validate with Zod
      const validatedData = schema.parse(sanitizedBody);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(err.message);
          return acc;
        }, {} as Record<string, string[]>);

        next(new ValidationError('Validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize query parameters
      const sanitizedQuery = sanitizeRequestQuery(req.query);
      
      // Validate with Zod
      const validatedData = schema.parse(sanitizedQuery);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(err.message);
          return acc;
        }, {} as Record<string, string[]>);

        next(new ValidationError('Query validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.reduce((acc, err) => {
          const path = err.path.join('.');
          if (!acc[path]) {
            acc[path] = [];
          }
          acc[path].push(err.message);
          return acc;
        }, {} as Record<string, string[]>);

        next(new ValidationError('Parameter validation failed', validationErrors));
      } else {
        next(error);
      }
    }
  };
}

function sanitizeRequestBody(body: any): any {
  if (typeof body !== 'object' || body === null) {
    return body;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      // Sanitize string values based on field type
      switch (key) {
        case 'email':
          sanitized[key] = SanitizerUtil.sanitizeEmail(value);
          break;
        case 'username':
          sanitized[key] = SanitizerUtil.sanitizeUsername(value);
          break;
        case 'content':
        case 'excerpt':
          sanitized[key] = SanitizerUtil.sanitizeHtml(value);
          break;
        case 'imageUrl':
          sanitized[key] = SanitizerUtil.sanitizeUrl(value);
          break;
        default:
          sanitized[key] = SanitizerUtil.sanitizeText(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? SanitizerUtil.sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function sanitizeRequestQuery(query: any): any {
  if (typeof query !== 'object' || query === null) {
    return query;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      if (key === 'q') {
        sanitized[key] = SanitizerUtil.sanitizeSearchQuery(value);
      } else {
        sanitized[key] = SanitizerUtil.sanitizeText(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
