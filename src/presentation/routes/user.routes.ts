import { Router } from 'express';
import { Container } from 'inversify';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import { UpdateUserSchema, PaginationSchema } from '../../shared/validation/schemas';
import { Role } from '../../domain/entities/user.entity';

export function userRoutes(container: Container): Router {
  const router = Router();
  const userController = container.get<UserController>('UserController');

  router.get('/', 
    authenticate(), 
    authorize([Role.ADMIN]), 
    validateQuery(PaginationSchema),
    (req, res, next) => userController.findMany(req, res, next)
  );

  router.get('/:id', 
    authenticate(), 
    (req, res, next) => userController.findById(req, res, next)
  );

  router.put('/:id', 
    authenticate(), 
    validateBody(UpdateUserSchema), 
    (req, res, next) => userController.update(req, res, next)
  );

  router.delete('/:id', 
    authenticate(), 
    authorize([Role.ADMIN]), 
    (req, res, next) => userController.delete(req, res, next)
  );

  return router;
}
