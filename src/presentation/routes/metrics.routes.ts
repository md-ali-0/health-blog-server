import { Router } from 'express';
import { Container } from 'inversify';
import { register } from 'prom-client';

export function metricsRoutes(container: Container): Router {
  const router = Router();

  router.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).end(error);
    }
  });

  return router;
}