const { prisma } = require("../../config/database");

const getChargersBySurvey = async (surveyId) => {
  return prisma.charger.findMany({
    where: { surveyId },
    include: {
      manufacturer: true,
      model: true,
      connector: true,
      mccbMaker: true,
      mcbMaker: true,
    },
  });
};

const addCharger = async (data) => {
  const survey = await prisma.survey.findUnique({ where: { id: data.surveyId } });
  if (!survey) throw new Error("Survey not found.");
  if (survey.isLocked) throw new Error("Cannot add details to locked survey.");

  return prisma.charger.create({
    data,
  });
};

const removeCharger = async (id) => {
  const charger = await prisma.charger.findUnique({ where: { id } });
  if (!charger) throw new Error("Charger record not found.");

  const survey = await prisma.survey.findUnique({ where: { id: charger.surveyId } });
  if (survey.isLocked) throw new Error("Cannot delete details from locked survey.");

  await prisma.charger.delete({ where: { id } });
  return true;
};

module.exports = {
  getChargersBySurvey,
  addCharger,
  removeCharger,
};
