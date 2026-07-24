import api from "./api";

const masterService = {
  // Manufacturers
  getManufacturers: async (params = {}) => {
    return api.get("/masters/charger-manufacturer", { params });
  },
  createManufacturer: async (data) => {
    return api.post("/masters/charger-manufacturer", data);
  },
  updateManufacturer: async (id, data) => {
    return api.patch(`/masters/charger-manufacturer/${id}`, data);
  },
  toggleManufacturerStatus: async (id) => {
    return api.patch(`/masters/charger-manufacturer/${id}/toggle-status`);
  },
  deleteManufacturer: async (id) => {
    return api.delete(`/masters/charger-manufacturer/${id}`);
  },

  // Charger Models
  getModels: async (manufacturerId = "", params = {}) => {
    const queryParams = typeof params === "object" ? { ...params } : {};
    if (manufacturerId) queryParams.manufacturerId = manufacturerId;
    return api.get("/masters/charger-model", { params: queryParams });
  },
  createModel: async (data) => {
    return api.post("/masters/charger-model", data);
  },
  updateModel: async (id, data) => {
    return api.patch(`/masters/charger-model/${id}`, data);
  },
  toggleModelStatus: async (id) => {
    return api.patch(`/masters/charger-model/${id}/toggle-status`);
  },
  deleteModel: async (id) => {
    return api.delete(`/masters/charger-model/${id}`);
  },

  // Connectors
  getConnectors: async (params = {}) => {
    return api.get("/masters/connector", { params });
  },
  createConnector: async (data) => {
    return api.post("/masters/connector", data);
  },
  updateConnector: async (id, data) => {
    return api.patch(`/masters/connector/${id}`, data);
  },
  toggleConnectorStatus: async (id) => {
    return api.patch(`/masters/connector/${id}/toggle-status`);
  },
  deleteConnector: async (id) => {
    return api.delete(`/masters/connector/${id}`);
  },

  // Equipment
  getEquipments: async (params = {}) => {
    return api.get("/masters/equipment", { params });
  },
  createEquipment: async (data) => {
    return api.post("/masters/equipment", data);
  },
  updateEquipment: async (id, data) => {
    return api.patch(`/masters/equipment/${id}`, data);
  },
  toggleEquipmentStatus: async (id) => {
    return api.patch(`/masters/equipment/${id}/toggle-status`);
  },
  deleteEquipment: async (id) => {
    return api.delete(`/masters/equipment/${id}`);
  },

  // Photo Categories
  getPhotoCategories: async (params = {}) => {
    return api.get("/masters/photo-category", { params });
  },
  createPhotoCategory: async (data) => {
    return api.post("/masters/photo-category", data);
  },
  updatePhotoCategory: async (id, data) => {
    return api.patch(`/masters/photo-category/${id}`, data);
  },
  togglePhotoCategoryStatus: async (id) => {
    return api.patch(`/masters/photo-category/${id}/toggle-status`);
  },
  deletePhotoCategory: async (id) => {
    return api.delete(`/masters/photo-category/${id}`);
  },
};

export default masterService;
