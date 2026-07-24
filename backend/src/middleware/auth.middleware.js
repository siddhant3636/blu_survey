const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { prisma } = require("../config/database");
const apiResponse = require("../utils/apiResponse");

const auth = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return apiResponse.unauthorized(res, "Access denied. No token provided.");
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        isActive: true, 
        isDeleted: true },
    });

    if (!user || user.isDeleted) {
      return apiResponse.unauthorized(res, "User not found or deleted.");
    }

    if (!user.isActive) {
      return apiResponse.forbidden(res, "Your account has been deactivated.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return apiResponse.unauthorized(res, "Token has expired.");
    }
    return apiResponse.unauthorized(res, "Invalid token.");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.unauthorized(res, "Authentication required.");
    }
    if (!roles.includes(req.user.role)) {
      return apiResponse.forbidden(res, `Access denied. Requires one of: ${roles.join(", ")}`);
    }
    next();
  };
};

module.exports = {
  auth,
  authorize,
};
