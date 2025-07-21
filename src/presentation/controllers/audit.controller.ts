import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { catchAsync } from '../../shared/utils/catch-async.util';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class AuditController {
  constructor(
    @inject('IAuditLogRepository') private auditLogRepository: IAuditLogRepository
  ) {}

  public getAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogRepository.findMany({ skip, take: limit }),
      this.auditLogRepository.count(),
    ]);

    const response = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: logs,
    };

    ResponseUtil.sendSuccess(res, 'Audit logs retrieved successfully', response);
  });
}
