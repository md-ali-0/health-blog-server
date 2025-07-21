import { Router } from 'express';
import { Container } from 'inversify';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateQuery } from '../middleware/validation.middleware';
import { PaginationSchema } from '../../shared/validation/schemas';
import { Role } from '../../domain/entities/user.entity';

export function auditRoutes(container: Container): Router {
  const router = Router();
  const auditController = container.get<AuditController>('AuditController');

  router.get('/', 
    authenticate(), 
    authorize([Role.ADMIN]), 
    validateQuery(PaginationSchema),
    (req, res, next) => auditController.findMany(req, res, next)
  );

  router.get('/user/:userId', 
    authenticate(), 
    authorize([Role.ADMIN]), 
    validateQuery(PaginationSchema),
    (req, res, next) => auditController.findByUser(req, res, next)
  );

  router.get('/entity/:entityType/:entityId', 
    authenticate(), 
    authorize([Role.ADMIN]), 
    (req, res, next) => auditController.findByEntity(req, res, next)
  );

  return router;
}
