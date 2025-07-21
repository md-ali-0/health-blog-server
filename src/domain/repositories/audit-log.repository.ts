import { AuditLog } from '@prisma/client';

export type CreateAuditLogDto = Omit<AuditLog, 'id' | 'createdAt'>;

export interface IAuditLogRepository {
  create(data: CreateAuditLogDto): Promise<AuditLog>;
  findMany(options: { skip?: number; take?: number }): Promise<AuditLog[]>;
  count(): Promise<number>;
}
