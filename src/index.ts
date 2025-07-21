import "reflect-metadata";
import { App } from "./app";
import { container } from "./config/container";
import { config } from "./config/config"; // Eagerly load and validate config
import { logger } from "./shared/utils/logger";

async function bootstrap(): Promise<void> {
    try {
        logger.info(`Starting application in ${config.server.nodeEnv} mode...`);
        const app = container.get<App>("App");
        await app.start();
    } catch (error) {
        logger.fatal("Failed to start application:", error);
        process.exit(1);
    }
}

function shutdown(signal: string): void {
    logger.info(`${signal} received, shutting down gracefully...`);
    // Add any cleanup logic here (e.g., close database connections)
    process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

void bootstrap();
