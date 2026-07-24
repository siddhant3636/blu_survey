const { prisma } = require("../../config/database");

const getSurveyData = async (surveyId) => {
  return prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      surveySite: true,
      createdBySurveyor: { select: { id: true, name: true, email: true } },
      chargers: {
        include: {
          manufacturer: true,
          model: true,
          connector: true,
          mccbMaker: true,
          mcbMaker: true,
        },
      },
      panels: true,
      transformers: true,
      dgs: true,
      photos: { include: { category: true } },
    },
  });
};

module.exports = {
  getSurveyData,
};
