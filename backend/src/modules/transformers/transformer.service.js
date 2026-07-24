const { prisma } = require("../../config/database");

const getTransformersBySurvey = async (surveyId) => {
  return prisma.transformer.findMany({ where: { surveyId } });
};

const addTransformer = async (data) => {
  const survey = await prisma.survey.findUnique({ where: { id: data.surveyId } });
  if (!survey) throw new Error("Survey not found.");
  if (survey.isLocked) throw new Error("Cannot add details to locked survey.");

  return prisma.transformer.create({ data });
};

const removeTransformer = async (id) => {
  const xformer = await prisma.transformer.findUnique({ where: { id } });
  if (!xformer) throw new Error("Transformer not found.");

  const survey = await prisma.survey.findUnique({ where: { id: xformer.surveyId } });
  if (survey.isLocked) throw new Error("Cannot delete details from locked survey.");

  await prisma.transformer.delete({ where: { id } });
  return true;
};

module.exports = {
  getTransformersBySurvey,
  addTransformer,
  removeTransformer,
};
