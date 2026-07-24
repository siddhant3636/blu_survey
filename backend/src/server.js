const app = require("./app");
const appConfig = require("./config/appConfig");
const logger = require("./config/logger");
const { prisma } = require("./config/database");

const PORT = appConfig.port;

const startServer = async () => {
  try {
    // Test Database connection
    await prisma.$connect();
    logger.info("Database connection established successfully.");

    const server = app.listen(PORT, () => {
      logger.info(`Server is running in ${appConfig.env} mode on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info("Received shutdown signal. Closing server...");
      server.close(async () => {
        logger.info("HTTP server closed.");
        await prisma.$disconnect();
        logger.info("Database connection closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
