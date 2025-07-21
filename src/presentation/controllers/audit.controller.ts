import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuditService } from '../../application/services/audit.service';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class AuditController {
  constructor(
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  async findMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        userId: req.query.userId as string,
        entityType: req.query.entityType as string,
      };

      const result = await this.auditService.findMany(query);
      ResponseUtil.success(res, result, 'Audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.auditService.findByUser(req?.params?.userId as string, query);
      ResponseUtil.success(res, result, 'User audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findByEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const result = await this.auditService.findByEntity(entityType as string, entityId as string);
      ResponseUtil.success(res, result, 'Entity audit logs retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
