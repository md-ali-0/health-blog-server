import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuditService } from '../../application/services/audit.service';
import { IPostService } from '../../application/services/post.service';
import { ResponseUtil } from '../../shared/utils/response.util';

@injectable()
export class PostController {
  constructor(
    @inject('IPostService') private postService: IPostService,
    @inject('IAuditService') private auditService: IAuditService
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postData = {
        ...req.body,
        authorId: req.user.id,
      };

      const post = await this.postService.create(postData);

      // Log audit
      await this.auditService.log({
        action: 'POST_CREATED',
        entityType: 'Post',
        entityId: post.id,
        userId: req.user.id,
        timestamp: new Date(),
        newValues: { title: post.title, content: post.content },
        id: ''
      });

      ResponseUtil.created(res, post, 'Post created successfully');
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.params.id) {
        ResponseUtil.badRequest(res, 'Post ID is required');
        return;
      }
      const post = await this.postService.findById(req.params.id);
      ResponseUtil.success(res, post, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.params.slug) {
        ResponseUtil.badRequest(res, 'Post slug is required');
        return;
      }
      const post = await this.postService.findBySlug(req.params.slug);
      ResponseUtil.success(res, post, 'Post retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        status: req.query.status as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      };
      
      const result = await this.postService.findMany(query);
      ResponseUtil.success(res, result, 'Posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async findByAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      if (!req.params.authorId) {
        ResponseUtil.badRequest(res, 'Author ID is required');
        return;
      }

      const result = await this.postService.findByAuthor(req.params.authorId, query);
      ResponseUtil.success(res, result, 'Posts retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const result = await this.postService.search(searchTerm, query);
      ResponseUtil.success(res, result, 'Search results retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params.id;

      if (!postId) {
        ResponseUtil.badRequest(res, 'Post ID is required');
        return;
      }
      const oldPost = await this.postService.findById(postId);
      const updatedPost = await this.postService.update(postId, req.body);

      // Log audit
      await this.auditService.log({
        action: 'POST_UPDATED',
        entityType: 'Post',
        entityId: postId,
        oldValues: { title: oldPost.title, content: oldPost.content },
        newValues: { title: updatedPost.title, content: updatedPost.content },
        userId: req.user.id,
        timestamp: new Date(),
        id: ''
      });

      ResponseUtil.success(res, updatedPost, 'Post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const postId = req.params.id;
      if (!postId) {
        ResponseUtil.badRequest(res, 'Post ID is required');
        return;
      }
      const post = await this.postService.findById(postId);
      await this.postService.delete(postId);

      // Log audit
      await this.auditService.log({
        action: 'POST_DELETED',
        entityType: 'Post',
        entityId: postId,
        oldValues: { title: post.title, content: post.content },
        userId: req.user.id,
        timestamp: new Date(),
        id: ''
      });

      ResponseUtil.noContent(res, 'Post deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
