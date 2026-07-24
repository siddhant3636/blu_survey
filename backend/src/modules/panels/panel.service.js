const { prisma } = require("../../config/database");

const getPanelsBySurvey = async (surveyId) => {
  return prisma.panel.findMany({ where: { surveyId } });
};

const addPanel = async (data) => {
  const survey = await prisma.survey.findUnique({ where: { id: data.surveyId } });
  if (!survey) throw new Error("Survey not found.");
  if (survey.isLocked) throw new Error("Cannot add details to locked survey.");

  return prisma.panel.create({ data });
};

const removePanel = async (id) => {
  const panel = await prisma.panel.findUnique({ where: { id } });
  if (!panel) throw new Error("Panel not found.");

  const survey = await prisma.survey.findUnique({ where: { id: panel.surveyId } });
  if (survey.isLocked) throw new Error("Cannot delete details from locked survey.");

  await prisma.panel.delete({ where: { id } });
  return true;
};

module.exports = {
  getPanelsBySurvey,
  addPanel,
  removePanel,
};
