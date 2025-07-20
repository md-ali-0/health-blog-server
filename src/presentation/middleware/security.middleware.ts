import { NextFunction, Request, Response } from "express";
import ExpressBrute from "express-brute";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import helmet from "helmet";
import Redis from "ioredis";
import ipRangeCheck from "ip-range-check";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { config } from "../../config/config";

// --- Redis client setup with conditional TLS ---
const redisUrl = new URL(config.redis.url);
const isTLS = redisUrl.protocol === "rediss:" || redisUrl.protocol === "https:";

const redisOptions: any = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port) || 6379,
  username: "default",
  password: redisUrl.password,
};

if (isTLS) {
  redisOptions.tls = {};
}

const redisClient = new Redis(redisOptions);

// --- Rate limiter for login brute force protection ---
const loginRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail",
  points: 5, // ৫ বার free attempts
  duration: 60 * 15, // ১৫ মিনিট
  blockDuration: 60 * 60, // ১ ঘন্টা ব্লক
});

// --- ExpressBrute store setup for registration brute force ---
const bruteStore = new ExpressBrute.MemoryStore();

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

export const registerBruteForce = new ExpressBrute(bruteStore, {
  freeRetries: 3,
  minWait: 10 * 60 * 1000, // ১০ মিনিট
  maxWait: 2 * 60 * 60 * 1000, // ২ ঘণ্টা
  lifetime: 24 * 60 * 60, // ২৪ ঘণ্টা
  failCallback: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many registration attempts. Please try again later.",
      code: "TOO_MANY_ATTEMPTS",
      details: { retryAfter: "10 minutes" },
    });
  },
});

// --- General API rate limiter ---
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
  skip: (req) =>
    ["/api/v1/health", "/api/v1/metrics"].includes(req.path), // health & metrics skip
});

// --- Auth specific strict rate limiter ---
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // ১৫ মিনিট
  max: 10,
  message: {
    error: "Too many authentication attempts",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    details: { windowMs: 15 * 60 * 1000 },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Slow down middleware for expensive ops ---
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // প্রথম 50টা request ফ্রি
  delayMs: () => 500, // এরপর প্রতি request-এ 500ms delay
  maxDelayMs: 20000, // সর্বোচ্চ delay 20s
});

// --- Helmet security config ---
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
    maxAge: 31536000, // ১ বছর
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

// --- Mongo sanitize config ---
export const mongoSanitizeConfig = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key ${key} in request from ${req.ip}`);
  },
});

// --- IP whitelist middleware supporting IP ranges ---
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP =
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "";

    if (config.server.nodeEnv === "development") {
      return next(); // Development mode skip
    }

    if (!ipRangeCheck(clientIP, allowedIPs)) {
      return res.status(403).json({
        error: "Access denied from this IP address",
        code: "IP_NOT_ALLOWED",
        details: { ip: clientIP },
      });
    }

    next();
  };
};

// --- Request size limiting middleware ---
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

// --- Size parser helper ---
function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1] ?? "0") || 0;
  const unit = match[2] || "b";

  return Math.floor(value * (units[unit] ?? 1));
}
