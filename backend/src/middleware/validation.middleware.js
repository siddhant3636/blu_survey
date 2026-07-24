const apiResponse = require("../utils/apiResponse");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      return apiResponse.validationError(res, "Validation error occurred.", errors);
    }

    req[property] = value; // Replace with validated & sanitized data
    next();
  };
};

module.exports = validate;
