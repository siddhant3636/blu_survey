const settingsService = require("./settings.service");
const apiResponse = require("../../utils/apiResponse");

const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    return apiResponse.success(res, "Settings fetched successfully", { settings });
  } catch (error) {
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const setting = await settingsService.updateSetting(key, value);
    return apiResponse.success(res, "Setting updated successfully", { setting });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSetting,
};
