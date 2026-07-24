const transformerService = require("./transformer.service");
const apiResponse = require("../../utils/apiResponse");

const getTransformers = async (req, res, next) => {
  try {
    const transformers = await transformerService.getTransformersBySurvey(req.query.surveyId);
    return apiResponse.success(res, "Transformers fetched successfully", { transformers });
  } catch (error) {
    next(error);
  }
};

const addTransformer = async (req, res, next) => {
  try {
    const transformer = await transformerService.addTransformer(req.body);
    return apiResponse.success(res, "Transformer added successfully", { transformer }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const removeTransformer = async (req, res, next) => {
  try {
    await transformerService.removeTransformer(req.params.id);
    return apiResponse.success(res, "Transformer removed successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getTransformers,
  addTransformer,
  removeTransformer,
};
