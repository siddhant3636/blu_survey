const jwt = require("jsonwebtoken");
const jwtConfig = require("../../config/jwt");

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
};
