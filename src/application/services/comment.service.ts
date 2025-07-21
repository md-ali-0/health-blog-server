import { inject, injectable } from 'inversify';
import { Comment } from '@prisma/client';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { IAuditService } from './audit.service';

export interface ICommentService {
  createComment(data: { content: string; authorId: string; postId: string }, auditInfo: { ipAddress?: string, userAgent?: string }): Promise<Comment>;
}

@injectable()
export class CommentService implements ICommentService {
  constructor(
    @inject('ICommentRepository') private commentRepository: ICommentRepository,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  async createComment(data: { content: string; authorId: string; postId: string }, auditInfo: { ipAddress?: string, userAgent?: string }): Promise<Comment> {
    const comment = await this.commentRepository.create(data);

    await this.auditService.log({
      actionType: 'CREATE_COMMENT',
      entity: 'Comment',
      entityId: comment.id,
      userId: data.authorId,
      newValues: { content: comment.content, postId: comment.postId },
      ipAddress: auditInfo.ipAddress,
      userAgent: auditInfo.userAgent,
    });

    return comment;
  }
}
