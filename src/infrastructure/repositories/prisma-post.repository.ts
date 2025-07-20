import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import {
    CreatePostData,
    Post,
    UpdatePostData,
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

    async create(data: CreatePostData): Promise<Post> {
        return await this.prisma.post.create({
            data,
        });
    }

    async findById(id: string): Promise<Post | null> {
        return await this.prisma.post.findUnique({
            where: { id },
        });
    }

    async findBySlug(slug: string): Promise<Post | null> {
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

        return {
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

        return {
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
    }

    async update(id: string, data: UpdatePostData): Promise<Post> {
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

        return {
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
