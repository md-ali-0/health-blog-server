import { inject, injectable } from 'inversify';
import { Post } from '@prisma/client';
import { IPostRepository } from '../../domain/repositories/post.repository';
import { ICache } from '../../infrastructure/cache/cache.interface';
import { AppError } from '../../shared/errors/app.error';
import { StatusCodes } from 'http-status-codes';

export interface IPostService {
  createPost(data: { title: string; content: string; authorId: string }): Promise<Post>;
  getPostById(id: string): Promise<Post | null>;
  updatePost(id: string, data: { title?: string; content?: string }): Promise<Post>;
  deletePost(id: string): Promise<void>;
}

@injectable()
export class PostService implements IPostService {
  private readonly cachePrefix = 'post:';
  private readonly cacheTTL = 3600; // 1 hour in seconds

  constructor(
    @inject('IPostRepository') private postRepository: IPostRepository,
    @inject('ICache') private cache: ICache
  ) {}

  async createPost(data: { title: string; content: string; authorId: string }): Promise<Post> {
    return this.postRepository.create(data);
  }

  async getPostById(id: string): Promise<Post | null> {
    const cacheKey = `${this.cachePrefix}${id}`;
    
    // 1. Check cache first
    const cachedPost = await this.cache.get<Post>(cacheKey);
    if (cachedPost) {
      return cachedPost;
    }

    // 2. If not in cache, get from database
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Post not found');
    }

    // 3. Store in cache for future requests
    await this.cache.set(cacheKey, post, this.cacheTTL);

    return post;
  }

  async updatePost(id: string, data: { title?: string; content?: string }): Promise<Post> {
    const updatedPost = await this.postRepository.update(id, data);
    
    // Invalidate cache
    const cacheKey = `${this.cachePrefix}${id}`;
    await this.cache.del(cacheKey);

    return updatedPost;
  }

  async deletePost(id: string): Promise<void> {
    await this.postRepository.delete(id);

    // Invalidate cache
    const cacheKey = `${this.cachePrefix}${id}`;
    await this.cache.del(cacheKey);
  }
}
