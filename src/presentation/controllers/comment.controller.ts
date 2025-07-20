import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import { ICommentService } from '../../application/services/comment.service';
import { IAuditService } from '../../application/services/audit.service';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class CommentController {
  constructor(
    @inject('ICommentService') private commentService: ICommentService,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentData = {
        ...req.body,
        authorId: req.user.id,
      };

      const comment = await this.commentService.create(commentData);

      // Log audit
      await this.auditService.log({
        action: 'COMMENT_CREATED',
        entityType: 'Comment',
        entityId: comment.id,
        newValues: comment,
        userId: req.user.id,
      });

      ResponseUtil.created(res, comment, 'Comment created successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await this.commentService.findById(req.params.id);
      ResponseUtil.success(res, comment, 'Comment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findByPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.commentService.findByPost(req.params.postId, query);
      ResponseUtil.success(res, result, 'Comments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findReplies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.commentService.findReplies(req.params.parentId, query);
      ResponseUtil.success(res, result, 'Replies retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = req.params.id;
      const oldComment = await this.commentService.findById(commentId);
      const updatedComment = await this.commentService.update(commentId, req.body);

      // Log audit
      await this.auditService.log({
        action: 'COMMENT_UPDATED',
        entityType: 'Comment',
        entityId: commentId,
        oldValues: oldComment,
        newValues: updatedComment,
        userId: req.user.id,
      });

      ResponseUtil.success(res, updatedComment, 'Comment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = req.params.id;
      const comment = await this.commentService.findById(commentId);
      await this.commentService.delete(commentId);

      // Log audit
      await this.auditService.log({
        action: 'COMMENT_DELETED',
        entityType: 'Comment',
        entityId: commentId,
        oldValues: comment,
        userId: req.user.id,
      });

      ResponseUtil.noContent(res, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}