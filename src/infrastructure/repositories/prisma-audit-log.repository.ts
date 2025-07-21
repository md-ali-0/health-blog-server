import { PrismaClient, AuditLog } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { CreateAuditLogDto, IAuditLogRepository } from '../../domain/repositories/audit-log.repository';
import { IDatabase } from '../database/database.interface';

@injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
  private prisma: PrismaClient;

  constructor(@inject('IDatabase') private database: IDatabase) {
    this.prisma = this.database.getClient();
  }

  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data });
  }

  async findMany(options: { skip?: number; take?: number }): Promise<AuditLog[]> {
    return this.prisma.auditLog.findMany({
      ...options,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.auditLog.count();
  }
}
