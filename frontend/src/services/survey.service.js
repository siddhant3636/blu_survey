import api from "./api";

const surveyService = {
  getSurveys: async () => {
    return api.get("/survey");
  },

  getSurvey: async (id) => {
    return api.get(`/survey/${id}`);
  },

  getSurveyBySite: async (siteId) => {
    return api.get(`/survey/site/${siteId}`);
  },

  initiateStep1: async (data) => {
    return api.post("/survey/step1", data);
  },

  lockAsset: async (assetType, assetId) => {
    return api.post("/survey/lock-asset", { assetType, assetId });
  },

  unlockAsset: async (assetType, assetId) => {
    return api.post("/survey/unlock-asset", { assetType, assetId });
  },

  saveAssetData: async (assetType, assetId, data) => {
    return api.post("/survey/save-asset", { assetType, assetId, data });
  },

  submitSurvey: async (id) => {
    return api.post(`/survey/${id}/submit`);
  },

  reviewSurvey: async (id, status, reviewRemarks) => {
    return api.post(`/survey/${id}/review`, { status, reviewRemarks });
  },

  createSurvey: async (surveyData) => {
    return api.post("/survey", surveyData);
  },

  updateSurvey: async (id, surveyData) => {
    return api.put(`/survey/${id}`, surveyData);
  },

  // Photos
  getPhotos: async (surveyId) => {
    return api.get(`/photos?surveyId=${surveyId}`);
  },
  removePhoto: async (id) => {
    return api.delete(`/photos/${id}`);
  },
};

export default surveyService;
