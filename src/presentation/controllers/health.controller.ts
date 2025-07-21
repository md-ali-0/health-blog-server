import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { IDatabase } from '../../infrastructure/database/database.interface';
import { ICache } from '../../infrastructure/cache/cache.interface';
import { IJobQueue } from '../../infrastructure/queue/queue.interface';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class HealthController {
  constructor(
    @inject('IDatabase') private database: IDatabase,
    @inject('ICache') private cache: ICache,
    @inject('IJobQueue') private jobQueue: IJobQueue
  ) {}

  async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [dbHealth, cacheHealth, queueHealth] = await Promise.all([
        this.database.isHealthy(),
        this.cache.isHealthy(),
        this.jobQueue.isHealthy(),
      ]);

      const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          database: dbHealth ? 'healthy' : 'unhealthy',
          cache: cacheHealth ? 'healthy' : 'unhealthy',
          queue: queueHealth ? 'healthy' : 'unhealthy',
        },
      };

      const overallHealth = dbHealth && cacheHealth && queueHealth;
      const statusCode = overallHealth ? 200 : 503;

      res.status(statusCode).json(health);
    } catch (error) {
      next(error);
    }
  }
}
