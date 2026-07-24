const generateSurveyTemplate = (siteId, surveyorId) => {
  return {
    surveySiteId: siteId,
    surveyorId,
    status: "DRAFT",
    remarks: "",
    isLocked: false,
  };
};

module.exports = {
  generateSurveyTemplate,
};
