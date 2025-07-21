import { Router } from 'express';
import { Container } from 'inversify';
import { HealthController } from '../controllers/health.controller';

export function healthRoutes(container: Container): Router {
  const router = Router();
  const healthController = container.get<HealthController>('HealthController');

  router.get('/health', (req, res, next) => 
    healthController.healthCheck(req, res, next)
  );

  return router;
}
