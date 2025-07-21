import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { config } from "../../config/config";
import { ApiError } from "../../shared/errors/ApiError";
import { ILogger } from "../../shared/interfaces/logger.interface";
import { ConflictError } from "../../shared/errors/conflict.error";
import { NotFoundError } from "../../shared/errors/not-found.error";
import { BadRequestError } from "../../shared/errors/bad-request.error";

const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError): ApiError => {
    switch (err.code) {
        case 'P2002':
            // Unique constraint violation
            const fields = (err.meta?.target as string[])?.join(', ');
            return new ConflictError(`A record with this ${fields} already exists.`);
        case 'P2025':
            // Record to update/delete not found
            return new NotFoundError('Record', 'provided identifier');
        case 'P2003':
             // Foreign key constraint failed
            const fieldName = err.meta?.field_name as string;
            return new BadRequestError(`Foreign key constraint failed on the field: ${fieldName}`);
        default:
            // Generic Prisma error
            return new BadRequestError('Database request failed.', { code: err.code });
    }
};


export const errorHandler =
    (logger: ILogger) =>
    (
        err: Error,
        req: Request,
        res: Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: NextFunction
    ): void => {
        logger.error(err);

        let apiError: ApiError;

        if (err instanceof ApiError) {
            apiError = err;
        } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
            apiError = handlePrismaError(err);
        } else if (err instanceof ZodError) {
            apiError = new BadRequestError("Validation Error", {
                code: "VALIDATION_ERROR",
                details: err.errors,
            });
        } else {
            const isDevelopment = config.server.nodeEnv === "development";
            apiError = new ApiError(
                500,
                "Internal Server Error",
                "INTERNAL_ERROR",
                isDevelopment ? { message: err.message, stack: err.stack } : {}
            );
        }

        res.status(apiError.statusCode).json({
            success: false,
            error: apiError.message,
            code: apiError.errorCode,
            details: apiError.details,
        });
    };
