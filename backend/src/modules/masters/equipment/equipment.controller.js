const equipmentService = require("./equipment.service");
const apiResponse = require("../../../utils/apiResponse");

const getEquipments = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === "true";
    const equipments = await equipmentService.getEquipments({ activeOnly });
    return apiResponse.success(res, "Equipments fetched successfully", { equipments });
  } catch (error) {
    next(error);
  }
};

const getEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id);
    return apiResponse.success(res, "Equipment fetched successfully", { equipment });
  } catch (error) {
    return apiResponse.notFound(res, error.message);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.createEquipment(req.body);
    return apiResponse.success(res, "Equipment created successfully", { equipment }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await equipmentService.updateEquipment(req.params.id, req.body);
    return apiResponse.success(res, "Equipment updated successfully", { equipment });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const equipment = await equipmentService.toggleEquipmentStatus(req.params.id);
    return apiResponse.success(res, "Equipment status updated successfully", { equipment });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    await equipmentService.deleteEquipment(req.params.id);
    return apiResponse.success(res, "Equipment deleted successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getEquipments,
  getEquipment,
  createEquipment,
  updateEquipment,
  toggleStatus,
  deleteEquipment,
};
