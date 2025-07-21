import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { config } from "../../config/config";
import { ApiError } from "../../shared/errors/ApiError";
import { ILogger } from "../../shared/interfaces/logger.interface";

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

        if (err instanceof ApiError) {
            res.status(err.statusCode).json({
                error: err.message,
                code: err.errorCode,
                details: err.details,
            });
            return;
        }

        if (err instanceof ZodError) {
            res.status(400).json({
                error: "Validation Error",
                code: "VALIDATION_ERROR",
                details: err.errors,
            });
            return;
        }

        const isDevelopment = config.server.nodeEnv === "development";
        res.status(500).json({
            error: "Internal Server Error",
            code: "INTERNAL_ERROR",
            details: isDevelopment ? { message: err.message, stack: err.stack } : {},
        });
    };
