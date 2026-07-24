const chargerService = require("./charger.service");
const apiResponse = require("../../utils/apiResponse");

const getChargers = async (req, res, next) => {
  try {
    const chargers = await chargerService.getChargersBySurvey(req.query.surveyId);
    return apiResponse.success(res, "Chargers fetched successfully", { chargers });
  } catch (error) {
    next(error);
  }
};

const addCharger = async (req, res, next) => {
  try {
    const charger = await chargerService.addCharger(req.body);
    return apiResponse.success(res, "Charger added to survey successfully", { charger }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const removeCharger = async (req, res, next) => {
  try {
    await chargerService.removeCharger(req.params.id);
    return apiResponse.success(res, "Charger removed from survey successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getChargers,
  addCharger,
  removeCharger,
};
