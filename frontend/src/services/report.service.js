import api from "./api";

const getBaseURL = () => {
  let url = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
  if (
    typeof window !== "undefined" &&
    window.location &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("127.0.0.1") &&
    url.includes("localhost")
  ) {
    url = window.location.origin + "/api/v1";
  }
  return url;
};

const reportService = {
  getExcelReportUrl: (surveyId) => {
    const baseURL = getBaseURL();
    const token = localStorage.getItem("token");
    return `${baseURL}/reports/${surveyId}/excel${token ? `?token=${token}` : ""}`;
  },

  getPDFReportUrl: (surveyId) => {
    const baseURL = getBaseURL();
    const token = localStorage.getItem("token");
    return `${baseURL}/reports/${surveyId}/pdf${token ? `?token=${token}` : ""}`;
  },
};

export default reportService;
