const userService = require("./user.service");
const apiResponse = require("../../utils/apiResponse");

const getUsers = async (req, res, next) => {
  try {
    const roleFilter = req.user.role === "SUB_ADMIN" ? "SURVEY_PERSON" : null;
    const users = await userService.getAllUsers(roleFilter);
    return apiResponse.success(res, "Users fetched successfully", { users });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (req.user.role === "SUB_ADMIN" && user.role !== "SURVEY_PERSON") {
      return apiResponse.forbidden(res, "Access denied. Sub Admin can only view Survey Persons.");
    }
    return apiResponse.success(res, "User profile fetched successfully", { user });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    if (req.user.role === "SUB_ADMIN") {
      req.body.role = "SURVEY_PERSON"; // Sub Admin can only create Survey Persons
    }
    const user = await userService.createUser(req.body);
    return apiResponse.success(res, "User created successfully", { user }, 201);
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return apiResponse.error(res, error.message, statusCode);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user.role === "SUB_ADMIN") {
      const targetUser = await userService.getUserById(req.params.id);
      if (targetUser.role !== "SURVEY_PERSON") {
        return apiResponse.forbidden(res, "Access denied. Sub Admin can only edit Survey Persons.");
      }
      req.body.role = "SURVEY_PERSON"; // Prevent role promotion
    }
    const user = await userService.updateUser(req.params.id, req.body);
    return apiResponse.success(res, "User updated successfully", { user });
  } catch (error) {
    const statusCode = error.statusCode || 400;
    return apiResponse.error(res, error.message, statusCode);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user.role === "SUB_ADMIN") {
      const targetUser = await userService.getUserById(req.params.id);
      if (targetUser.role !== "SURVEY_PERSON") {
        return apiResponse.forbidden(res, "Access denied. Sub Admin can only delete Survey Persons.");
      }
    }
    await userService.deleteUser(req.params.id);
    return apiResponse.success(res, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
