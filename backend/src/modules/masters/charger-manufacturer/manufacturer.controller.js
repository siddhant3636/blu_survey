const manufacturerService = require("./manufacturer.service");
const apiResponse = require("../../../utils/apiResponse");

const getManufacturers = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === "true";
    const manufacturers = await manufacturerService.getManufacturers({ activeOnly });
    return apiResponse.success(res, "Manufacturers fetched successfully", { manufacturers });
  } catch (error) {
    next(error);
  }
};

const getManufacturer = async (req, res, next) => {
  try {
    const manufacturer = await manufacturerService.getManufacturerById(req.params.id);
    return apiResponse.success(res, "Manufacturer fetched successfully", { manufacturer });
  } catch (error) {
    return apiResponse.notFound(res, error.message);
  }
};

const createManufacturer = async (req, res, next) => {
  try {
    const manufacturer = await manufacturerService.createManufacturer(req.body);
    return apiResponse.success(res, "Manufacturer created successfully", { manufacturer }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateManufacturer = async (req, res, next) => {
  try {
    const manufacturer = await manufacturerService.updateManufacturer(req.params.id, req.body);
    return apiResponse.success(res, "Manufacturer updated successfully", { manufacturer });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const manufacturer = await manufacturerService.toggleManufacturerStatus(req.params.id);
    return apiResponse.success(res, "Manufacturer status updated successfully", { manufacturer });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteManufacturer = async (req, res, next) => {
  try {
    await manufacturerService.deleteManufacturer(req.params.id);
    return apiResponse.success(res, "Manufacturer deleted successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getManufacturers,
  getManufacturer,
  createManufacturer,
  updateManufacturer,
  toggleStatus,
  deleteManufacturer,
};
