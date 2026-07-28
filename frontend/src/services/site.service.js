import api from "./api";

const siteService = {
  getSites: async () => {
    return api.get("/survey-sites");
  },

  getSite: async (id) => {
    return api.get(`/survey-sites/${id}`);
  },

  createSite: async (siteData) => {
    return api.post("/survey-sites", siteData);
  },

  updateSite: async (id, siteData) => {
    return api.put(`/survey-sites/${id}`, siteData);
  },

  deleteSite: async (id) => {
    return api.delete(`/survey-sites/${id}`);
  },

  // Assignments
  getAssignments: async () => {
    return api.get("/survey-assignment");
  },

  createAssignment: async (assignmentData) => {
    return api.post("/survey-assignment", assignmentData);
  },

  updateAssignmentStatus: async (id, status) => {
    return api.patch(`/survey-assignment/${id}/status`, { status });
  },

  deleteAssignment: async (id) => {
    return api.delete(`/survey-assignment/${id}`);
  },

  bulkUploadSites: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/survey-sites/bulk-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default siteService;
