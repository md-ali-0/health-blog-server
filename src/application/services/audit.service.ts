import { inject, injectable } from 'inversify';
import { CreateAuditLogDto, IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { ILogger } from '../../shared/interfaces/logger.interface';

export interface IAuditService {
  log(data: CreateAuditLogDto): Promise<void>;
}

@injectable()
export class AuditService implements IAuditService {
  constructor(
    @inject('IAuditLogRepository') private auditLogRepository: IAuditLogRepository,
    @inject('ILogger') private logger: ILogger
  ) {}

  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      await this.auditLogRepository.create(data);
    } catch (error) {
      this.logger.error('Failed to create audit log', { error, data });
      // We don't re-throw here because a failure to audit should not
      // typically fail the primary user-facing operation.
    }
  }
}
