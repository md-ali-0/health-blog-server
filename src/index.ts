import dotenv from "dotenv";
import "reflect-metadata";
import { App } from "./app";
import { container } from "./config/container";

// Load environment variables
dotenv.config();

async function bootstrap(): Promise<void> {
    try {
        const app = container.get<App>("App");
        await app.start();
    } catch (error) {
        console.error("Failed to start application:", error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    process.exit(0);
});

void bootstrap();
