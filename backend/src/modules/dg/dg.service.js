const { prisma } = require("../../config/database");

const getDGsBySurvey = async (surveyId) => {
  return prisma.dG.findMany({ where: { surveyId } });
};

const addDG = async (data) => {
  const survey = await prisma.survey.findUnique({ where: { id: data.surveyId } });
  if (!survey) throw new Error("Survey not found.");
  if (survey.isLocked) throw new Error("Cannot add details to locked survey.");

  return prisma.dG.create({ data });
};

const removeDG = async (id) => {
  const dg = await prisma.dG.findUnique({ where: { id } });
  if (!dg) throw new Error("DG record not found.");

  const survey = await prisma.survey.findUnique({ where: { id: dg.surveyId } });
  if (survey.isLocked) throw new Error("Cannot delete details from locked survey.");

  await prisma.dG.delete({ where: { id } });
  return true;
};

module.exports = {
  getDGsBySurvey,
  addDG,
  removeDG,
};
