const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const appConfig = require("./config/appConfig");
const morganMiddleware = require("./middleware/logger.middleware");
const rateLimiter = require("./middleware/rateLimit.middleware");
const errorHandler = require("./middleware/error.middleware");
const routes = require("./routes");
const apiResponse = require("./utils/apiResponse");

const app = express();

// Global Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (appConfig.allowedOrigins.includes(origin) || appConfig.env === "development") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);



// Rate Limiting for API routes
if (appConfig.env === "production") {
  app.use("/api", rateLimiter);
}

// Static directories for uploads
app.use("/uploads", express.static(path.join(process.cwd(), appConfig.uploadPath)));

// Base Route
app.get("/health", (req, res) => {
  return apiResponse.success(res, "API server is healthy and running", {
    env: appConfig.env,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/", routes);

// 404 Route handler
app.use((req, res, next) => {
  return apiResponse.notFound(res, `Route ${req.originalUrl} not found`);
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
