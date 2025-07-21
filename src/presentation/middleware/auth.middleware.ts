import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/container';
import { IAuthService } from '../../application/services/auth.service';
import { AuthError, ForbiddenError } from '../../shared/errors/auth.error';
import { Role } from '../../domain/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      id: string;
    }
  }
}

export function authenticate() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthError('No token provided');
      }

      const token = authHeader.substring(7);
      const authService = container.get<IAuthService>('IAuthService');
      const user = await authService.verifyToken(token);

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function authorize(roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
