require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || "development",
  url: process.env.APP_URL || "http://localhost:5000",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(","),
  uploadPath: process.env.UPLOAD_PATH || "src/uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760", 10),
};
