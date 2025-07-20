import compression from "compression";
import cors from "cors";
import express, { Application } from "express";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../config/config";
import {
    apiRateLimit,
    helmetConfig,
    mongoSanitizeConfig,
    requestSizeLimit,
    speedLimiter,
} from "./security.middleware";

export function setupMiddleware(app: Application): void {
    // Trust proxy for accurate IP addresses
    app.set("trust proxy", 1);

    // Request ID middleware
    app.use((req, res, next) => {
        req.id = uuidv4();
        res.setHeader("X-Request-ID", req.id);
        next();
    });

    // Logging middleware
    app.use(
        pinoHttp({
            genReqId: (req) => req.id,
            level: config.logging.level,
            serializers: {
                req: (req) => ({
                    id: req.id,
                    method: req.method,
                    url: req.url,
                    headers: {
                        host: req.headers.host,
                        "user-agent": req.headers["user-agent"],
                        "content-type": req.headers["content-type"],
                    },
                    remoteAddress: req.remoteAddress,
                    remotePort: req.remotePort,
                }),
                res: (res) => {
                    const safeGet = (header: string) =>
                        typeof res.getHeader === "function"
                            ? res.getHeader(header)
                            : undefined;

                    return {
                        statusCode: res.statusCode,
                        headers: {
                            "content-type": safeGet("content-type"),
                            "content-length": safeGet("content-length"),
                        },
                    };
                },
            },
        })
    );

    // Security middleware
    app.use(helmetConfig);

    // CORS configuration
    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (mobile apps, Postman, etc.)
                if (!origin) return callback(null, true);

                if (config.cors.origin.includes(origin)) {
                    return callback(null, true);
                }

                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            allowedHeaders: [
                "Origin",
                "X-Requested-With",
                "Content-Type",
                "Accept",
                "Authorization",
                "X-Request-ID",
            ],
            exposedHeaders: [
                "X-Request-ID",
                "X-RateLimit-Limit",
                "X-RateLimit-Remaining",
            ],
            maxAge: 86400, // 24 hours
        })
    );

    // Request size limiting
    app.use(requestSizeLimit("10mb"));

    // Rate limiting and speed limiting
    app.use(apiRateLimit);
    app.use(speedLimiter);

    // Body parsing with size limits
    app.use(
        express.json({
            limit: "10mb",
            strict: true,
            type: ["application/json", "application/*+json"],
        })
    );

    app.use(
        express.urlencoded({
            extended: true,
            limit: "10mb",
            parameterLimit: 1000,
        })
    );

    // Security sanitization
    app.use(mongoSanitizeConfig);

    // Parameter pollution protection
    app.use(
        hpp({
            whitelist: ["tags", "sort"], // Allow arrays for these parameters
        })
    );

    // Compression
    app.use(
        compression({
            level: 6,
            threshold: 1024,
            filter: (req, res) => {
                if (req.headers["x-no-compression"]) {
                    return false;
                }
                return compression.filter(req, res);
            },
        })
    );

    // Static files with security headers
    app.use(
        "/uploads",
        express.static("uploads", {
            maxAge: "1d",
            etag: true,
            lastModified: true,
            setHeaders: (res, path) => {
                res.setHeader("X-Content-Type-Options", "nosniff");
                res.setHeader("Cache-Control", "public, max-age=86400");
            },
        })
    );

    // Security headers for API responses
    app.use((req, res, next) => {
        res.setHeader("X-API-Version", "1.0.0");
        res.setHeader("X-Response-Time", Date.now().toString());
        next();
    });
}
