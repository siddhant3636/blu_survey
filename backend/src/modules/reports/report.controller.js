const reportService = require("./report.service");
const { exportSurveyToExcel } = require("./excel.export");
const { exportSurveyToPDF } = require("./pdf.export");
const apiResponse = require("../../utils/apiResponse");

const downloadExcelReport = async (req, res, next) => {
  try {
    const survey = await reportService.getSurveyData(req.params.surveyId);
    if (!survey) {
      return apiResponse.notFound(res, "Survey not found.");
    }
    await exportSurveyToExcel(survey, res);
  } catch (error) {
    next(error);
  }
};

const downloadPDFReport = async (req, res, next) => {
  try {
    const survey = await reportService.getSurveyData(req.params.surveyId);
    if (!survey) {
      return apiResponse.notFound(res, "Survey not found.");
    }
    await exportSurveyToPDF(survey, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadExcelReport,
  downloadPDFReport,
};
