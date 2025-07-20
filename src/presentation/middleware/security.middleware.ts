import { NextFunction, Request, Response } from "express";
import ExpressBrute from "express-brute";
import ExpressBruteRedis from "express-brute-redis";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import helmet from "helmet";
import { config } from "../../config/config";

// Redis store for brute force protection
const bruteStore = new ExpressBruteRedis({
    host: config.redis.url.includes("://")
        ? new URL(config.redis.url).hostname
        : "localhost",
    port: config.redis.url.includes("://")
        ? parseInt(new URL(config.redis.url).port) || 6379
        : 6379,
});

// Brute force protection for login attempts
export const loginBruteForce = new ExpressBrute(bruteStore, {
    freeRetries: 5,
    minWait: 5 * 60 * 1000, // 5 minutes
    maxWait: 60 * 60 * 1000, // 1 hour
    lifetime: 24 * 60 * 60, // 24 hours
    failCallback: (req: Request, res: Response, next: NextFunction) => {
        res.status(429).json({
            error: "Too many failed login attempts. Please try again later.",
            code: "TOO_MANY_ATTEMPTS",
            details: { retryAfter: "5 minutes" },
        });
    },
});

// Brute force protection for registration
export const registerBruteForce = new ExpressBrute(bruteStore, {
    freeRetries: 3,
    minWait: 10 * 60 * 1000, // 10 minutes
    maxWait: 2 * 60 * 60 * 1000, // 2 hours
    lifetime: 24 * 60 * 60, // 24 hours
    failCallback: (req: Request, res: Response, next: NextFunction) => {
        res.status(429).json({
            error: "Too many registration attempts. Please try again later.",
            code: "TOO_MANY_ATTEMPTS",
            details: { retryAfter: "10 minutes" },
        });
    },
});

// General API rate limiting
export const apiRateLimit = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        error: "Too many requests from this IP",
        code: "RATE_LIMIT_EXCEEDED",
        details: { windowMs: config.rateLimit.windowMs },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === "/api/v1/health" || req.path === "/api/v1/metrics";
    },
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: {
        error: "Too many authentication attempts",
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        details: { windowMs: 15 * 60 * 1000 },
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Speed limiting for expensive operations
export const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per windowMs without delay
    delayMs: 500, // Add 500ms delay per request after delayAfter
    maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Enhanced Helmet configuration
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
});

// MongoDB injection protection
export const mongoSanitizeConfig = mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized key ${key} in request from ${req.ip}`);
    },
});

// IP whitelist middleware for admin operations
export const ipWhitelist = (allowedIPs: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientIP =
            req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

        if (config.server.nodeEnv === "development") {
            return next(); // Skip in development
        }

        if (!allowedIPs.includes(clientIP as string)) {
            return res.status(403).json({
                error: "Access denied from this IP address",
                code: "IP_NOT_ALLOWED",
                details: { ip: clientIP },
            });
        }

        next();
    };
};

// Request size limiting
export const requestSizeLimit = (maxSize: string = "10mb") => {
    return (req: Request, res: Response, next: NextFunction) => {
        const contentLength = parseInt(req.get("content-length") || "0");
        const maxBytes = parseSize(maxSize);

        if (contentLength > maxBytes) {
            return res.status(413).json({
                error: "Request entity too large",
                code: "PAYLOAD_TOO_LARGE",
                details: { maxSize, receivedSize: contentLength },
            });
        }

        return next();
    };
};

function parseSize(size: string): number {
    const units: { [key: string]: number } = {
        b: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024,
    };

    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) return 0;

    const value = parseFloat(match?.[1] ?? "0");

    const unit = match[2] || "b";

    return Math.floor(value * (units[unit] ?? 1));
}
