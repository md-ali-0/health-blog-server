import { Router } from 'express';
import { Container } from 'inversify';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { authRateLimit, loginBruteForce, registerBruteForce } from '../middleware/security.middleware';
import { RegisterSchema, LoginSchema } from '../../shared/validation/schemas';

export function authRoutes(container: Container): Router {
  const router = Router();
  const authController = container.get<AuthController>('AuthController');

  // Apply auth-specific rate limiting
  router.use(authRateLimit);

  router.post('/register', 
    registerBruteForce.prevent,
    validateBody(RegisterSchema), 
    (req, res, next) => authController.register(req, res, next)
  );

  router.post('/login', 
    loginBruteForce.prevent,
    validateBody(LoginSchema), 
    (req, res, next) => authController.login(req, res, next)
  );

  router.post('/logout', 
    authenticate(), 
    (req, res, next) => authController.logout(req, res, next)
  );

  router.get('/me', 
    authenticate(), 
    (req, res, next) => authController.me(req, res, next)
  );

  return router;
}