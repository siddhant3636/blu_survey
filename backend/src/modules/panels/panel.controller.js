const panelService = require("./panel.service");
const apiResponse = require("../../utils/apiResponse");

const getPanels = async (req, res, next) => {
  try {
    const panels = await panelService.getPanelsBySurvey(req.query.surveyId);
    return apiResponse.success(res, "Panels fetched successfully", { panels });
  } catch (error) {
    next(error);
  }
};

const addPanel = async (req, res, next) => {
  try {
    const panel = await panelService.addPanel(req.body);
    return apiResponse.success(res, "Panel added successfully", { panel }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const removePanel = async (req, res, next) => {
  try {
    await panelService.removePanel(req.params.id);
    return apiResponse.success(res, "Panel removed successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getPanels,
  addPanel,
  removePanel,
};
