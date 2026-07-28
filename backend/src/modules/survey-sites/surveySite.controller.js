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
      const { name, concessionaire, landOwningAgency, address, status, surveyorIds } = req.body;

      payload = {
        ...(name !== undefined ? { name } : {}),
        ...(concessionaire !== undefined ? { concessionaire } : {}),
        ...(landOwningAgency !== undefined ? { landOwningAgency } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(surveyorIds !== undefined ? { surveyorIds } : {}),
      };
    } else {
      return apiResponse.forbidden(res, "Role is not authorized to edit survey site.");
    }

    const site = await surveySiteService.updateSite(req.params.id, payload, req.user);
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

const bulkUploadSites = async (req, res, next) => {
  try {
    if (!req.file) {
      return apiResponse.badRequest(res, "Please upload an Excel file.");
    }
    const result = await surveySiteService.bulkUploadSites(req.file.buffer);
    return apiResponse.success(res, "Bulk upload processed successfully", { result });
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
  bulkUploadSites,
};
