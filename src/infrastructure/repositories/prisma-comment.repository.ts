import { PrismaClient } from '@prisma/client';
import { inject, injectable } from 'inversify';
import { Comment, UpdateCommentData } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';
import { IDatabase } from '../database/database.interface';

@injectable()
export class PrismaCommentRepository implements ICommentRepository {
  private prisma: PrismaClient;

  constructor(@inject('IDatabase') database: IDatabase) {
    this.prisma = (database as any).getClient();
  }

  async create(data: Comment): Promise<Comment> {
    // @ts-ignore
    return await this.prisma.comment.create({
      data,
    });
  }

  async findById(id: string): Promise<Comment | null> {
    // @ts-ignore
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

    const result = {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
    // @ts-ignore
    return result
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

    const result = {
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
    // @ts-ignore
    return result
  }

  async update(id: string, data: UpdateCommentData): Promise<Comment> {
    // @ts-ignore
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
