import express, { Application } from "express";
import { inject, injectable } from "inversify";
import { config } from "./config/config";
import { ICache } from "./infrastructure/cache/cache.interface";
import { IDatabase } from "./infrastructure/database/database.interface";
import { IJobQueue } from "./infrastructure/queue/queue.interface";
import { errorHandler } from "./presentation/middleware/error-handler.middleware";
import { setupMiddleware } from "./presentation/middleware/index.middleware";
import { setupRoutes } from "./presentation/routes";
import { ILogger } from "./shared/interfaces/logger.interface";

@injectable()
export class App {
    private app: Application;

    constructor(
        @inject("ILogger") private logger: ILogger,
        @inject("IDatabase") private database: IDatabase,
        @inject("ICache") private cache: ICache,
        @inject("IJobQueue") private queue: IJobQueue
    ) {
        this.app = express();
        this.setupApplication();
    }

    private setupApplication(): void {
        // Setup essential middleware (Helmet, CORS, etc.)
        setupMiddleware(this.app, this.logger);

        // Setup API routes
        setupRoutes(this.app);

        // Centralized error handling middleware (must be last)
        this.app.use(errorHandler(this.logger));
    }

    public async start(): Promise<void> {
        try {
            // Initialize database connection
            await this.database.connect();
            this.logger.info("Database connected successfully");

            // Initialize cache connection
            await this.cache.connect();
            
            // Initialize job queue connection
            await this.queue.connect();

            // Start server
            const port = config.server.port;
            this.app.listen(port, () => {
                this.logger.info(`Server running on port ${port}`);
                this.logger.info(`Environment: ${config.server.nodeEnv}`);
                this.logger.info(
                    `Health check available at http://localhost:${port}/api/v1/health`
                );
                this.logger.info(
                    `API documentation available at http://localhost:${port}/api-docs`
                );
            });
        } catch (error) {
            this.logger.error("Failed to start application", error);
            process.exit(1);
        }
    }

    public getApp(): Application {
        return this.app;
    }
}
