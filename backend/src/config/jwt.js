module.exports = {
  secret: process.env.JWT_SECRET || "super_secret_jwt_key_change_me_in_production",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "super_secret_refresh_jwt_key_change_me",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
};
