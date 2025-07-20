import { inject, injectable } from "inversify";
import {
  AuditLog,
  CreateAuditLogData,
} from "../../domain/entities/audit-log.entity";
import { IAuditLogRepository } from "../../domain/repositories/audit-log.repository";
import {
  PaginationQuery,
  PaginationResult,
} from "../../shared/types/common.types";

export interface IAuditService {
    log(data: CreateAuditLogData): Promise<AuditLog>;
    findMany(
        query: PaginationQuery & { userId?: string; entityType?: string }
    ): Promise<PaginationResult<AuditLog>>;
    findByUser(
        userId: string,
        query: PaginationQuery
    ): Promise<PaginationResult<AuditLog>>;
    findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}

@injectable()
export class AuditService implements IAuditService {
    constructor(
        @inject("IAuditLogRepository")
        private auditLogRepository: IAuditLogRepository
    ) {}

    async log(data: CreateAuditLogData): Promise<AuditLog> {
        return await this.auditLogRepository.create(data);
    }

    async findMany(
        query: PaginationQuery & { userId?: string; entityType?: string }
    ): Promise<PaginationResult<AuditLog>> {
        return await this.auditLogRepository.findMany(query);
    }

    async findByUser(
        userId: string,
        query: PaginationQuery
    ): Promise<PaginationResult<AuditLog>> {
        return await this.auditLogRepository.findByUser(userId, query);
    }

    async findByEntity(
        entityType: string,
        entityId: string
    ): Promise<AuditLog[]> {
        return await this.auditLogRepository.findByEntity(entityType, entityId);
    }
}
