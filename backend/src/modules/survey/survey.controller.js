const surveyService = require("./survey.service");
const apiResponse = require("../../utils/apiResponse");

const getSurveys = async (req, res, next) => {
  try {
    const surveys = await surveyService.getAllSurveys(req.user);
    return apiResponse.success(res, "Surveys fetched successfully", { surveys });
  } catch (error) {
    next(error);
  }
};

const getSurvey = async (req, res, next) => {
  try {
    const survey = await surveyService.getSurveyById(req.params.id, req.user);
    return apiResponse.success(res, "Survey details fetched successfully", { survey });
  } catch (error) {
    next(error);
  }
};

const getSurveyBySite = async (req, res, next) => {
  try {
    const survey = await surveyService.getSurveyBySiteId(req.params.siteId, req.user);
    return apiResponse.success(res, "Survey details fetched successfully", { survey });
  } catch (error) {
    next(error);
  }
};

const initiateStep1 = async (req, res, next) => {
  try {
    const survey = await surveyService.initiateStep1(req.user.id, req.body);
    return apiResponse.success(res, "Step 1 completed and assets auto-generated successfully", { survey }, 201);
  } catch (error) {
    if (error.message.includes("completed by")) {
      return apiResponse.conflict(res, error.message);
    }
    return apiResponse.badRequest(res, error.message);
  }
};

const lockAsset = async (req, res, next) => {
  try {
    const locked = await surveyService.lockAsset(req.user.id, req.body);
    return apiResponse.success(res, "Asset locked for exclusive survey", { asset: locked });
  } catch (error) {
    if (error.message.includes("locked/being edited") || error.message.includes("completed by")) {
      return apiResponse.conflict(res, error.message);
    }
    return apiResponse.badRequest(res, error.message);
  }
};

const unlockAsset = async (req, res, next) => {
  try {
    await surveyService.unlockAsset(req.user.id, req.body);
    return apiResponse.success(res, "Asset lock released successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const saveAssetData = async (req, res, next) => {
  try {
    const asset = await surveyService.saveAssetData(req.user.id, req.body);
    return apiResponse.success(res, "Asset survey saved and completed successfully", { asset });
  } catch (error) {
    if (error.statusCode === 409 || error.message.includes("being edited") || error.message.includes("expired")) {
      return apiResponse.conflict(res, error.message);
    }
    return apiResponse.badRequest(res, error.message);
  }
};

const reviewSurvey = async (req, res, next) => {
  try {
    const survey = await surveyService.reviewSurvey(req.user.id, req.params.id, req.body);
    return apiResponse.success(res, `Survey ${req.body.status} successfully`, { survey });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateSurvey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const survey = await surveyService.updateSurvey(req.user.id, id, { status, remarks });
    return apiResponse.success(res, "Survey updated successfully", { survey });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const submitSurvey = async (req, res, next) => {
  try {
    const survey = await surveyService.submitSurvey(req.user.id, req.params.id);
    return apiResponse.success(res, "Survey submitted successfully", { survey });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getSurveys,
  getSurvey,
  getSurveyBySite,
  initiateStep1,
  lockAsset,
  unlockAsset,
  saveAssetData,
  submitSurvey,
  reviewSurvey,
  updateSurvey,
};
