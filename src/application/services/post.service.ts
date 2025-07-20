import { inject, injectable } from "inversify";
import {
  CreatePostData,
  Post,
  UpdatePostData,
} from "../../domain/entities/post.entity";
import { IPostRepository } from "../../domain/repositories/post.repository";
import { NotFoundError } from "../../shared/errors/not-found.error";
import {
  PaginationQuery,
  PaginationResult,
  SearchQuery,
} from "../../shared/types/common.types";
import { SlugUtil } from "../../shared/utils/slug.util";

export interface IPostService {
    create(data: CreatePostData): Promise<Post>;
    findById(id: string): Promise<Post>;
    findBySlug(slug: string): Promise<Post>;
    findMany(
        query: PaginationQuery & SearchQuery
    ): Promise<PaginationResult<Post>>;
    findByAuthor(
        authorId: string,
        query: PaginationQuery
    ): Promise<PaginationResult<Post>>;
    update(id: string, data: UpdatePostData): Promise<Post>;
    delete(id: string): Promise<void>;
    search(
        searchTerm: string,
        query: PaginationQuery
    ): Promise<PaginationResult<Post>>;
}

@injectable()
export class PostService implements IPostService {
    constructor(
        @inject("IPostRepository") private postRepository: IPostRepository
    ) {}

    async create(data: CreatePostData): Promise<Post> {
        // Generate unique slug
        const baseSlug = SlugUtil.generate(data.title);
        const existingSlugs = await this.postRepository.findSimilarSlugs(
            baseSlug
        );
        const slug = SlugUtil.generateUnique(data.title, existingSlugs);

        return await this.postRepository.create({
            ...data,
            slug,
        });
    }

    async findById(id: string): Promise<Post> {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new NotFoundError("Post", id);
        }
        return post;
    }

    async findBySlug(slug: string): Promise<Post> {
        const post = await this.postRepository.findBySlug(slug);
        if (!post) {
            throw new NotFoundError("Post");
        }
        return post;
    }

    async findMany(
        query: PaginationQuery & SearchQuery
    ): Promise<PaginationResult<Post>> {
        return await this.postRepository.findMany(query);
    }

    async findByAuthor(
        authorId: string,
        query: PaginationQuery
    ): Promise<PaginationResult<Post>> {
        return await this.postRepository.findByAuthor(authorId, query);
    }

    async update(id: string, data: UpdatePostData): Promise<Post> {
        const existingPost = await this.postRepository.findById(id);
        if (!existingPost) {
            throw new NotFoundError("Post", id);
        }

        // Generate new slug if title is updated
        let updateData = { ...data };
        if (data.title && data.title !== existingPost.title) {
            const baseSlug = SlugUtil.generate(data.title);
            const existingSlugs = await this.postRepository.findSimilarSlugs(
                baseSlug
            );
            updateData.slug = SlugUtil.generateUnique(
                data.title,
                existingSlugs.filter((s) => s !== existingPost.slug)
            );
        }

        return await this.postRepository.update(id, updateData);
    }

    async delete(id: string): Promise<void> {
        const post = await this.postRepository.findById(id);
        if (!post) {
            throw new NotFoundError("Post", id);
        }

        await this.postRepository.delete(id);
    }

    async search(
        searchTerm: string,
        query: PaginationQuery
    ): Promise<PaginationResult<Post>> {
        return await this.postRepository.search(searchTerm, query);
    }
}
