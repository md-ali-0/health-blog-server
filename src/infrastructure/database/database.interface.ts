import { PrismaClient } from "@prisma/client";

export interface IDatabase {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isHealthy(): Promise<boolean>;

    // নতুন মেথড যোগ করা হলো
    getClient(): PrismaClient;
}

export class Database implements IDatabase {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async connect(): Promise<void> {
        await this.prisma.$connect();
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
    }

    getClient(): PrismaClient {
        return this.prisma;
    }

    async isHealthy(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            return false;
        }
    }
}
