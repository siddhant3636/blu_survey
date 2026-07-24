const rateLimit = require("express-rate-limit");
const apiResponse = require("../utils/apiResponse");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return apiResponse.error(
      res,
      "Too many requests from this IP, please try again after 15 minutes.",
      429
    );
  },
});

module.exports = limiter;
