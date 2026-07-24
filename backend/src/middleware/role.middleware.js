const apiResponse = require("../utils/apiResponse");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.unauthorized(res, "Authentication required.");
    }

    if (!roles.includes(req.user.role)) {
      return apiResponse.forbidden(
        res,
        `Role (${req.user.role}) is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = authorize;
