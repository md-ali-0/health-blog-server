import compression from "compression";
import cors from "cors";
import express, { Application } from "express";
import helmet from "helmet";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { ILogger } from "../../shared/interfaces/logger.interface";

export function setupMiddleware(app: Application, logger: ILogger): void {
    // Security middleware
    app.use(helmet());

    // Enable CORS
    app.use(cors({
        origin: "*", // Configure for specific origins in production
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        credentials: true,
    }));

    // Prevent HTTP Parameter Pollution
    app.use(hpp());

    // Compress responses
    app.use(compression());

    // Parse JSON bodies
    app.use(express.json({ limit: "10kb" }));

    // Parse URL-encoded bodies
    app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // Add request logging
    app.use(pinoHttp({ logger: logger as any }));
}
