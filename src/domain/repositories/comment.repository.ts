import { Comment, CreateCommentData, UpdateCommentData } from '../entities/comment.entity';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';

export interface ICommentRepository {
  create(data: CreateCommentData): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByPost(postId: string, query: PaginationQuery): Promise<PaginationResult<Comment>>;
  findReplies(parentId: string, query: PaginationQuery): Promise<PaginationResult<Comment>>;
  update(id: string, data: UpdateCommentData): Promise<Comment>;
  delete(id: string): Promise<void>;
  countByPost(postId: string): Promise<number>;
}