const modelService = require("./model.service");
const apiResponse = require("../../../utils/apiResponse");

const getModels = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === "true";
    const models = await modelService.getModelsByManufacturer(req.query.manufacturerId, { activeOnly });
    return apiResponse.success(res, "Models fetched successfully", { models });
  } catch (error) {
    next(error);
  }
};

const getModel = async (req, res, next) => {
  try {
    const model = await modelService.getModelById(req.params.id);
    return apiResponse.success(res, "Model fetched successfully", { model });
  } catch (error) {
    return apiResponse.notFound(res, error.message);
  }
};

const createModel = async (req, res, next) => {
  try {
    const model = await modelService.createModel(req.body);
    return apiResponse.success(res, "Model created successfully", { model }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateModel = async (req, res, next) => {
  try {
    const model = await modelService.updateModel(req.params.id, req.body);
    return apiResponse.success(res, "Model updated successfully", { model });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const model = await modelService.toggleModelStatus(req.params.id);
    return apiResponse.success(res, "Model status updated successfully", { model });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteModel = async (req, res, next) => {
  try {
    await modelService.deleteModel(req.params.id);
    return apiResponse.success(res, "Model deleted successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getModels,
  getModel,
  createModel,
  updateModel,
  toggleStatus,
  deleteModel,
};
