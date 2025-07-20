import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import {
    Post
} from "../../domain/entities/post.entity";
import { IPostRepository } from "../../domain/repositories/post.repository";
import {
    PaginationQuery,
    PaginationResult,
    SearchQuery,
} from "../../shared/types/common.types";
import { IDatabase } from "../database/database.interface";

@injectable()
export class PrismaPostRepository implements IPostRepository {
    private prisma: PrismaClient;

    constructor(@inject("IDatabase") database: IDatabase) {
        this.prisma = (database as any).getClient();
    }

    async create(data: Post): Promise<Post> {

        if (!data.slug) {
            data.slug = data.title.toLowerCase().replace(/\s+/g, "-");
        }
        if (await this.existsBySlug(data.slug)) {
            throw new Error(`Post with slug ${data.slug} already exists`);
        }
        const similarSlugs = await this.findSimilarSlugs(data.slug);
        if (similarSlugs.length > 0) {
            data.slug = `${data.slug}-${similarSlugs.length + 1}`;
        }
        
        data.tags = data.tags || [];

        const createdPost = await this.prisma.post.create({
            data,
        });
// @ts-ignore
        return createdPost
    }

    async findById(id: string): Promise<Post | null> {
        if (!id) {
            throw new Error("Post ID is required");
        }
        if (typeof id !== "string") {
            throw new Error("Post ID must be a string");
        }
        // @ts-ignore
        return await this.prisma.post.findUnique({
            where: { id },
        });
    }

    async findBySlug(slug: string): Promise<Post | null> {
        // @ts-ignore
        return await this.prisma.post.findUnique({
            where: { slug },
        });
    }

    async findMany(
        query: PaginationQuery & SearchQuery
    ): Promise<PaginationResult<Post>> {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            status,
            tags,
        } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.post.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const result = {
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
        // @ts-ignore
        return result
    }

    async findByAuthor(
        authorId: string,
        query: PaginationQuery
    ): Promise<PaginationResult<Post>> {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = query;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { authorId },
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.post.count({ where: { authorId } }),
        ]);

        const totalPages = Math.ceil(total / limit);

        const result = {
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
        // @ts-ignore
        return result
    }

    async update(id: string, data: Partial<Post>): Promise<Post> {
        // @ts-ignore
        return await this.prisma.post.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.post.delete({
            where: { id },
        });
    }

    async search(
        searchTerm: string,
        query: PaginationQuery
    ): Promise<PaginationResult<Post>> {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = query;
        const skip = (page - 1) * limit;

        const [posts, total] = await Promise.all([
            this.prisma.post.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            content: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            excerpt: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            this.prisma.post.count({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            content: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                        {
                            excerpt: {
                                contains: searchTerm,
                                mode: "insensitive",
                            },
                        },
                    ],
                },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const result = {
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
        // @ts-ignore
        return result
    }

    async existsBySlug(slug: string): Promise<boolean> {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            select: { id: true },
        });
        return !!post;
    }

    async findSimilarSlugs(baseSlug: string): Promise<string[]> {
        const posts = await this.prisma.post.findMany({
            where: {
                slug: { startsWith: baseSlug },
            },
            select: { slug: true },
        });
        return posts.map((post) => post.slug);
    }
}
