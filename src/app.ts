import express, { Application } from "express";
import { inject, injectable } from "inversify";
import { config } from "./config/config";
import { ICache } from "./infrastructure/cache/cache.interface";
import { IDatabase } from "./infrastructure/database/database.interface";
import { setupMiddleware } from "./presentation/middleware";
import { errorHandler } from "./presentation/middleware/error-handler";
import { setupRoutes } from "./presentation/routes";
import { ILogger } from "./shared/interfaces/logger.interface";

@injectable()
export class App {
    private app: Application;

    constructor(
        @inject("ILogger") private logger: ILogger,
        @inject("IDatabase") private database: IDatabase,
        @inject("ICache") private cache: ICache
    ) {
        this.app = express();
        this.setupApplication();
    }

    private setupApplication(): void {
        // Setup middleware
        setupMiddleware(this.app);

        // Setup routes
        setupRoutes(this.app);

        // Error handling middleware (must be last)
        this.app.use(errorHandler);
    }

    public async start(): Promise<void> {
        try {
            // Initialize database connection
            await this.database.connect();
            this.logger.info("Database connected successfully");

            // Initialize cache connection
            await this.cache.connect();
            this.logger.info("Cache connected successfully");

            // Start server
            const port = config.server.port;
            this.app.listen(port, () => {
                this.logger.info(`Server running on port ${port}`);
                this.logger.info(`Environment: ${config.server.nodeEnv}`);
                this.logger.info(
                    `Health check available at http://localhost:${port}/api/v1/health`
                );
            });
        } catch (error) {
            this.logger.error("Failed to start application", error);
            throw error;
        }
    }

    public getApp(): Application {
        return this.app;
    }
}
