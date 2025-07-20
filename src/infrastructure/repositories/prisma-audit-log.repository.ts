
import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";

import { AuditLog } from "../../domain/entities/audit-log.entity";
import { IAuditLogRepository } from "../../domain/repositories/audit-log.repository";
import {
    PaginationQuery,
    PaginationResult,
} from "../../shared/types/common.types";
import { IDatabase } from "../database/database.interface";

@injectable()
export class PrismaAuditLogRepository implements IAuditLogRepository {
    private prisma: PrismaClient;

    constructor(@inject("IDatabase") database: IDatabase) {
        this.prisma = (database as any).getClient();
    }

    async create(data: AuditLog): Promise<AuditLog> {
        
        if (!data.userId || !data.entityType || !data.entityId) {
            throw new Error(
                "userId, entityType, and entityId are required to create an audit log"
            );
        }

        // const result = await this.prisma.auditLog.create({
        //     data : {...data},
        // });
        // @ts-ignore
        return result;
    }

    async findMany(
        query: PaginationQuery & { userId?: string; entityType?: string }
    ): Promise<PaginationResult<AuditLog>> {
        const {
            page = 1,
            limit = 10,
            sortBy = "timestamp",
            sortOrder = "desc",
            userId,
            entityType,
        } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (userId) where.userId = userId;
        if (entityType) where.entityType = entityType;

        const [auditLogs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const result ={
            data: auditLogs,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
        // @ts-ignore

        return result
    }

    async findByUser(
        userId: string,
        query: PaginationQuery
    ): Promise<PaginationResult<AuditLog>> {
        return this.findMany({ ...query, userId });
    }

    async findByEntity(
        entityType: string,
        entityId: string
    ): Promise<AuditLog[]> {
        if (!entityType || !entityId) {
            throw new Error("Entity type and ID must be provided");
        }
        // @ts-ignore
        return await this.prisma.auditLog.findMany({
            where: { entityType, entityId },
            orderBy: { timestamp: "desc" },
        });
    }
}
