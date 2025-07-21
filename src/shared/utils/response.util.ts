import { Response } from 'express';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class ResponseUtil {
    static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
        };
        res.status(statusCode).json(response);
    }

    static created<T>(res: Response, data: T, message = 'Resource created successfully'): void {
        this.success(res, data, message, 201);
    }

    static noContent(res: Response, message = 'Operation successful'): void {
        const response: ApiResponse<null> = {
            success: true,
            message,
        };
        res.status(204).json(response);
    }

    static paginated<T>(
        res: Response,
        data: T[],
        meta: { page: number; limit: number; total: number },
        message = 'Resources retrieved successfully'
    ): void {
        const totalPages = Math.ceil(meta.total / meta.limit);
        const response: ApiResponse<T[]> = {
            success: true,
            message,
            data,
            meta: { ...meta, totalPages },
        };
        res.status(200).json(response);
    }

    static error(res: Response, message = 'An error occurred', statusCode = 500, code?: string, details?: any): void {
        res.status(statusCode).json({
            success: false,
            error: message,
            code: code || 'INTERNAL_ERROR',
            details: details || null,
        });
    }

    static badRequest(res: Response, message = 'Bad Request', details?: any): void {
        this.error(res, message, 400, 'BAD_REQUEST', details);
    }
}
