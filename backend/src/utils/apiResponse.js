const success = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const error = (res, message, statusCode = 500, errorCode = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode || statusCode,
      message,
    },
  });
};

const badRequest = (res, message) => {
  return error(res, message, 400);
};

const unauthorized = (res, message = "Unauthorized") => {
  return error(res, message, 401);
};

const forbidden = (res, message = "Forbidden") => {
  return error(res, message, 403);
};

const notFound = (res, message = "Resource not found") => {
  return error(res, message, 404);
};

const validationError = (res, message, errors = []) => {
  return res.status(422).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  success,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  validationError,
};
