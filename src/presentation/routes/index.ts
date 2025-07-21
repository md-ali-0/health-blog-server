import { Application } from "express";
import { container } from "../../config/container";
import { auditRoutes } from "./audit.routes";
import { authRoutes } from "./auth.routes";
import { commentRoutes } from "./comment.routes";
import { docsRoutes } from "./docs.routes";
import { healthRoutes } from "./health.routes";
import { metricsRoutes } from "./metrics.routes";
import { postRoutes } from "./post.routes";
import { userRoutes } from "./user.routes";

export function setupRoutes(app: Application): void {
    const basePath = "/api/v1";

    // Documentation route (no auth required)
    app.use("/api-docs", docsRoutes());

    // Health and metrics (no auth required)
    app.use(basePath, healthRoutes(container));
    app.use(basePath, metricsRoutes(container));

    // API routes
    app.use(`${basePath}/auth`, authRoutes(container));
    app.use(`${basePath}/users`, userRoutes(container));
    app.use(`${basePath}/posts`, postRoutes(container));
    app.use(`${basePath}/comments`, commentRoutes(container));
    app.use(`${basePath}/audit`, auditRoutes(container));

    // 404 handler for API routes
    app.use(basePath + "/*", (req, res) => {
        res.status(404).json({
            error: "API route not found",
            code: "NOT_FOUND",
            details: { path: req.originalUrl },
        });
    });
}
