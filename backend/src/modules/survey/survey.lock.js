const { prisma } = require("../../config/database");

const lockSurvey = async (surveyId) => {
  return prisma.survey.update({
    where: { id: surveyId },
    data: {
      isLocked: true,
      lockedAt: new Date(),
    },
  });
};

const unlockSurvey = async (surveyId) => {
  return prisma.survey.update({
    where: { id: surveyId },
    data: {
      isLocked: false,
      lockedAt: null,
    },
  });
};

module.exports = {
  lockSurvey,
  unlockSurvey,
};
