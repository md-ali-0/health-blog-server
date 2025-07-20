import { inject, injectable } from 'inversify';
import { Comment, CreateCommentData, UpdateCommentData } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../../domain/repositories/comment.repository';
import { IPostRepository } from '../../domain/repositories/post.repository';
import { IJobQueue } from '../../infrastructure/queue/queue.interface';
import { NotFoundError } from '../../shared/errors/not-found.error';
import { PaginationQuery, PaginationResult } from '../../shared/types/common.types';

export interface ICommentService {
  create(data: CreateCommentData): Promise<Comment>;
  findById(id: string): Promise<Comment>;
  findByPost(postId: string, query: PaginationQuery): Promise<PaginationResult<Comment>>;
  findReplies(parentId: string, query: PaginationQuery): Promise<PaginationResult<Comment>>;
  update(id: string, data: UpdateCommentData): Promise<Comment>;
  delete(id: string): Promise<void>;
}

@injectable()
export class CommentService implements ICommentService {
  constructor(
    @inject('ICommentRepository') private commentRepository: ICommentRepository,
    @inject('IPostRepository') private postRepository: IPostRepository,
    @inject('IJobQueue') private jobQueue: IJobQueue
  ) {}

  async create(data: Comment): Promise<Comment> {
    // Verify post exists
    const post = await this.postRepository.findById(data.postId);
    if (!post) {
      throw new NotFoundError('Post', data.postId);
    }

    // Verify parent comment exists if parentId is provided
    if (data.parentId) {
      const parentComment = await this.commentRepository.findById(data.parentId);
      if (!parentComment) {
        throw new NotFoundError('Comment', data.parentId);
      }
    }

    const comment = await this.commentRepository.create(data);

    // Queue email notification job
    await this.jobQueue.addJob('email', 'new-comment', {
      to: 'admin@example.com', // In real app, get post author's email
      subject: 'New Comment on Your Post',
      text: `A new comment has been posted on your post: ${post.title}`,
      html: `<p>A new comment has been posted on your post: <strong>${post.title}</strong></p>`,
    });

    return comment;
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError('Comment', id);
    }
    return comment;
  }

  async findByPost(postId: string, query: PaginationQuery): Promise<PaginationResult<Comment>> {
    // Verify post exists
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post', postId);
    }

    return await this.commentRepository.findByPost(postId, query);
  }

  async findReplies(parentId: string, query: PaginationQuery): Promise<PaginationResult<Comment>> {
    // Verify parent comment exists
    const parentComment = await this.commentRepository.findById(parentId);
    if (!parentComment) {
      throw new NotFoundError('Comment', parentId);
    }

    return await this.commentRepository.findReplies(parentId, query);
  }

  async update(id: string, data: UpdateCommentData): Promise<Comment> {
    const existingComment = await this.commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundError('Comment', id);
    }

    return await this.commentRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError('Comment', id);
    }

    await this.commentRepository.delete(id);
  }
}