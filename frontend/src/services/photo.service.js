import api from "./api";

const photoService = {
  getPhotos: async (surveyId) => {
    return api.get(`/photos?surveyId=${surveyId}`);
  },

  uploadPhoto: async (formData) => {
    return api.post("/photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadMultiplePhotos: async (formData) => {
    return api.post("/photos/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePhoto: async (photoId) => {
    return api.delete(`/photos/${photoId}`);
  },
};

export default photoService;
