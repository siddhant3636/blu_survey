const logger = require("../config/logger");
const apiResponse = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  // Handle specific errors (e.g. Prisma errors, custom errors)
  if (err.name === "PrismaClientKnownRequestError") {
    return apiResponse.error(res, "Database operation error occurred.", 500, err.code);
  }

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  return apiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
