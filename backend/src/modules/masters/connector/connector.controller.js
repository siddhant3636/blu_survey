const connectorService = require("./connector.service");
const apiResponse = require("../../../utils/apiResponse");

const getConnectors = async (req, res, next) => {
  try {
    const activeOnly = req.query.activeOnly === "true";
    const connectors = await connectorService.getConnectors({ activeOnly });
    return apiResponse.success(res, "Connectors fetched successfully", { connectors });
  } catch (error) {
    next(error);
  }
};

const getConnector = async (req, res, next) => {
  try {
    const connector = await connectorService.getConnectorById(req.params.id);
    return apiResponse.success(res, "Connector fetched successfully", { connector });
  } catch (error) {
    return apiResponse.notFound(res, error.message);
  }
};

const createConnector = async (req, res, next) => {
  try {
    const connector = await connectorService.createConnector(req.body);
    return apiResponse.success(res, "Connector created successfully", { connector }, 201);
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const updateConnector = async (req, res, next) => {
  try {
    const connector = await connectorService.updateConnector(req.params.id, req.body);
    return apiResponse.success(res, "Connector updated successfully", { connector });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const connector = await connectorService.toggleConnectorStatus(req.params.id);
    return apiResponse.success(res, "Connector status updated successfully", { connector });
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

const deleteConnector = async (req, res, next) => {
  try {
    await connectorService.deleteConnector(req.params.id);
    return apiResponse.success(res, "Connector deleted successfully");
  } catch (error) {
    return apiResponse.badRequest(res, error.message);
  }
};

module.exports = {
  getConnectors,
  getConnector,
  createConnector,
  updateConnector,
  toggleStatus,
  deleteConnector,
};
