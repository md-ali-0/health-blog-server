import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { ICache } from '../../infrastructure/cache/cache.interface';
import { IDatabase } from '../../infrastructure/database/database.interface';
import { IJobQueue } from '../../infrastructure/queue/queue.interface';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class HealthController {
  constructor(
    @inject('IDatabase') private database: IDatabase,
    @inject('ICache') private cache: ICache,
    @inject('IJobQueue') private queue: IJobQueue
  ) {}

  public check = async (_req: Request, res: Response): Promise<Response> => {
    const dbHealth = await this.database.isHealthy();
    const cacheHealth = await this.cache.isHealthy();
    const queueHealth = await this.queue.isHealthy();

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? 'ok' : 'error',
        cache: cacheHealth ? 'ok' : 'error',
        queue: queueHealth ? 'ok' : 'error',
      },
    };

    const isHealthy = dbHealth && cacheHealth && queueHealth;

    if (isHealthy) {
      return ResponseUtil.sendSuccess(res, 'System is healthy', healthStatus);
    }

    return ResponseUtil.sendError(
      res,
      StatusCodes.SERVICE_UNAVAILABLE,
      'One or more services are unhealthy',
      healthStatus
    );
  };
}
