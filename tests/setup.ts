import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean up data before each test
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
});
