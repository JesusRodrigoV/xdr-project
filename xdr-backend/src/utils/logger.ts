import winston from "winston";
import { Elysia } from "elysia";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

// Ensure logs directory exists
const LOG_DIR = join(process.cwd(), "logs");

try {
  await mkdir(LOG_DIR, { recursive: true });
} catch (error) {
  console.error("Failed to create logs directory:", error);
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: join(LOG_DIR, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: join(LOG_DIR, "combined.log"),
    }),
  ],
});

export const setupLogging = (app: Elysia) => {
  app.on("request", ({ request }) => {
    logger.info(`Incoming ${request.method} request to ${request.url}`, {
      method: request.method,
      url: request.url,
      headers: request.headers,
    });
  });

  app.on("error", ({ error, request }) => {
    logger.error("Request error occurred", {
      error: error.message,
      stack: error.stack,
      path: request?.url,
      method: request?.method,
    });
  });
};
