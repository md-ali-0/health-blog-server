import { Prisma, PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import {
  CreateUserData,
  UpdateUserData,
  User,
} from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repositories/user.repository";
import {
  PaginationQuery,
  PaginationResult,
} from "../../shared/types/common.types";
import { IDatabase } from "../database/database.interface";

@injectable()
export class PrismaUserRepository implements IUserRepository {
    private prisma: PrismaClient;

    constructor(@inject("IDatabase") database: IDatabase) {
        // এখানে `getClient()` আসলেই PrismaClient return করছে ধরে নিচ্ছি
        const client = database.getClient?.();
        if (!client) {
            throw new Error("Prisma client not initialized from database");
        }
        this.prisma = client;
    }

    async create(data: CreateUserData): Promise<User> {
      // @ts-ignore
        return this.prisma.user.create({
            data,
        });
    }

    async findById(id: string): Promise<User | null> {
      // @ts-ignore
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
      // @ts-ignore
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findByUsername(username: string): Promise<User | null> {
      // @ts-ignore
        return this.prisma.user.findUnique({
            where: { username },
        });
    }

    async findMany(query: PaginationQuery): Promise<PaginationResult<User>> {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = query;

        const skip = (page - 1) * limit;

        // Prisma এর জন্য orderBy টাইপ ঠিক করা
        const orderBy: Prisma.UserOrderByWithRelationInput = {
            [sortBy]: sortOrder === "asc" ? "asc" : "desc",
        };

        const [prismaUsers, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                orderBy,
            }),
            this.prisma.user.count(),
        ]);

        // @ts-ignore
        const users: User[] = prismaUsers.map((u) => ({
            ...u,
            firstName: u.firstName ?? "",
            lastName: u.lastName ?? "",
        }));

        const totalPages = Math.ceil(total / limit);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    async update(id: string, data: UpdateUserData): Promise<User> {
        // আপডেট করার আগে ইউজার আছে কিনা চেক করা
        const existing = await this.findById(id);
        if (!existing) throw new Error("User not found");

        // @ts-ignore
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        // ডিলিট করার আগে ইউজার আছে কিনা চেক করা
        const existing = await this.findById(id);
        if (!existing) throw new Error("User not found");

        await this.prisma.user.delete({
            where: { id },
        });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });
        return Boolean(user);
    }

    async existsByUsername(username: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });
        return Boolean(user);
    }
}
