const surveySiteService = require("./surveySite.service");
const apiResponse = require("../../utils/apiResponse");

const getSites = async (req, res, next) => {
  try {
    const sites = await surveySiteService.getAllSites(req.user);
    return apiResponse.success(res, "Survey sites fetched successfully", { sites });
  } catch (error) {
    next(error);
  }
};

const getSite = async (req, res, next) => {
  try {
    const site = await surveySiteService.getSiteById(req.params.id);
    return apiResponse.success(res, "Survey site details fetched successfully", { site });
  } catch (error) {
    next(error);
  }
};

const createSite = async (req, res, next) => {
  try {
    const site = await surveySiteService.createSite(req.body);
    return apiResponse.success(res, "Survey site created successfully", { site }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateSite = async (req, res, next) => {
  try {
    let payload = {};
    if (req.user.role === "ADMIN" || req.user.role === "SUB_ADMIN") {
      const { siteId, name, concessionaire, landOwningAgency, address, latitude, longitude, status } = req.body;

      payload = {
        ...(siteId ? { siteId: siteId.trim().toUpperCase() } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(concessionaire !== undefined ? { concessionaire } : {}),
        ...(landOwningAgency !== undefined ? { landOwningAgency } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(latitude !== undefined && latitude !== "" && latitude !== null && !isNaN(Number(latitude))
          ? { latitude: Number(latitude) }
          : latitude === null || latitude === "" ? { latitude: null } : {}),
        ...(longitude !== undefined && longitude !== "" && longitude !== null && !isNaN(Number(longitude))
          ? { longitude: Number(longitude) }
          : longitude === null || longitude === "" ? { longitude: null } : {}),
        ...(status !== undefined ? { status } : {}),
      };
    } else {
      return apiResponse.forbidden(res, "Role is not authorized to edit survey site.");
    }

    const site = await surveySiteService.updateSite(req.params.id, payload);
    return apiResponse.success(res, "Survey site updated successfully", { site });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteSite = async (req, res, next) => {
  try {
    await surveySiteService.deleteSite(req.params.id);
    return apiResponse.success(res, "Survey site deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSites,
  getSite,
  createSite,
  updateSite,
  deleteSite,
};
