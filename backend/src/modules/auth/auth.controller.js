const authService = require("./auth.service");
const apiResponse = require("../../utils/apiResponse");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return apiResponse.success(res, "Login successful", result);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return apiResponse.success(res, "Registration successful", result, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const me = async (req, res, next) => {
  try {
    return apiResponse.success(res, "Current user profile fetched", { user: req.user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  me,
};
