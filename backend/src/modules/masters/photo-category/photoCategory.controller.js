const photoCategoryService = require("./photoCategory.service");
const apiResponse = require("../../../utils/apiResponse");

const getCategories = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === "true";
    const categories = await photoCategoryService.getCategories({ activeOnly });
    return apiResponse.success(res, "Photo categories fetched successfully", { categories });
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const category = await photoCategoryService.getCategoryById(req.params.id);
    return apiResponse.success(res, "Photo category fetched successfully", { category });
  } catch (error) {
    return apiResponse.notFound(res, error.message);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await photoCategoryService.createCategory(req.body);
    return apiResponse.success(res, "Photo category created successfully", { category }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await photoCategoryService.updateCategory(req.params.id, req.body);
    return apiResponse.success(res, "Photo category updated successfully", { category });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const category = await photoCategoryService.toggleCategoryStatus(req.params.id);
    return apiResponse.success(res, "Photo category status updated successfully", { category });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await photoCategoryService.deleteCategory(req.params.id);
    return apiResponse.success(res, "Photo category deleted successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  toggleStatus,
  deleteCategory,
};
