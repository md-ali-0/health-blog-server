import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IDatabase } from './database.interface';

@injectable()
export class PrismaDatabase implements IDatabase {
  private client: PrismaClient;

  constructor() {
    this.client = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async connect(): Promise<void> {
    await this.client.$connect();
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  getClient(): PrismaClient {
    return this.client;
  }
}