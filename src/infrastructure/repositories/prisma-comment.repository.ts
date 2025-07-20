import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { Comment, CreateCommentData, UpdateCommentData } from '../../domain/entities/comment.entity';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';
import { IDatabase } from '../database/database.interface';

@injectable()
export class PrismaCommentRepository implements ICommentRepository {
  private prisma: PrismaClient;

  constructor(@inject('IDatabase') database: IDatabase) {
    this.prisma = (database as any).getClient();
  }

  async create(data: CreateCommentData): Promise<Comment> {
    return await this.prisma.comment.create({
      data,
    });
  }

  async findById(id: string): Promise<Comment | null> {
    return await this.prisma.comment.findUnique({
      where: { id },
    });
  }

  async findByPost(postId: string, query: PaginationQuery): Promise<PaginationResult<Comment>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, parentId: null },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.comment.count({ where: { postId, parentId: null } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
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

  async findReplies(parentId: string, query: PaginationQuery): Promise<PaginationResult<Comment>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'asc' } = query;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parentId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.comment.count({ where: { parentId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments,
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

  async update(id: string, data: UpdateCommentData): Promise<Comment> {
    return await this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async countByPost(postId: string): Promise<number> {
    return await this.prisma.comment.count({
      where: { postId },
    });
  }
}