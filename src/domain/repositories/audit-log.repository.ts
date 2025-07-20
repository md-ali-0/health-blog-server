import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';
import { AuditLog } from '../entities/audit-log.entity';

export interface IAuditLogRepository {
  create(data: AuditLog): Promise<AuditLog>;
  findMany(query: PaginationQuery & { userId?: string; entityType?: string }): Promise<PaginationResult<AuditLog>>;
  findByUser(userId: string, query: PaginationQuery): Promise<PaginationResult<AuditLog>>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}