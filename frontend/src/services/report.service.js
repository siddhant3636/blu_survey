import api from "./api";

const reportService = {
  getExcelReportUrl: (surveyId) => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const token = localStorage.getItem("token");
    return `${baseURL}/reports/${surveyId}/excel${token ? `?token=${token}` : ""}`;
  },

  getPDFReportUrl: (surveyId) => {
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const token = localStorage.getItem("token");
    return `${baseURL}/reports/${surveyId}/pdf${token ? `?token=${token}` : ""}`;
  },
};

export default reportService;
