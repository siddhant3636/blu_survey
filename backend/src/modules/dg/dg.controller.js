const dgService = require("./dg.service");
const apiResponse = require("../../utils/apiResponse");

const getDGs = async (req, res, next) => {
  try {
    const dgs = await dgService.getDGsBySurvey(req.query.surveyId);
    return apiResponse.success(res, "DG details fetched successfully", { dgs });
  } catch (error) {
    next(error);
  }
};

const addDG = async (req, res, next) => {
  try {
    const dg = await dgService.addDG(req.body);
    return apiResponse.success(res, "DG details added successfully", { dg }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const removeDG = async (req, res, next) => {
  try {
    await dgService.removeDG(req.params.id);
    return apiResponse.success(res, "DG details removed successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getDGs,
  addDG,
  removeDG,
};
