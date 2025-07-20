import { AuditLog, CreateAuditLogData } from '../entities/audit-log.entity';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';

export interface IAuditLogRepository {
  create(data: CreateAuditLogData): Promise<AuditLog>;
  findMany(query: PaginationQuery & { userId?: string; entityType?: string }): Promise<PaginationResult<AuditLog>>;
  findByUser(userId: string, query: PaginationQuery): Promise<PaginationResult<AuditLog>>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}