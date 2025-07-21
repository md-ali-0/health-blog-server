import { Post, CreatePostData, UpdatePostData } from '../entities/post.entity';
import { PaginationQuery, PaginationResult, SearchQuery } from '../../shared/types/common.types';

export interface IPostRepository {
  create(data: CreatePostData): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<Post | null>;
  findMany(query: PaginationQuery & SearchQuery): Promise<PaginationResult<Post>>;
  findByAuthor(authorId: string, query: PaginationQuery): Promise<PaginationResult<Post>>;
  update(id: string, data: UpdatePostData): Promise<Post>;
  delete(id: string): Promise<void>;
  search(searchTerm: string, query: PaginationQuery): Promise<PaginationResult<Post>>;
  existsBySlug(slug: string): Promise<boolean>;
  findSimilarSlugs(baseSlug: string): Promise<string[]>;
}
