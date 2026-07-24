const dashboardService = require("./dashboard.service");
const apiResponse = require("../../utils/apiResponse");

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats();
    return apiResponse.success(res, "Dashboard stats fetched successfully", stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
