const { prisma } = require("../../config/database");
const { formatSurveySite } = require("./surveySite.helper");

const getAllSites = async (user) => {
  let where = { isDeleted: false };

  if (user && (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR")) {
    where.assignments = {
      some: {
        surveyorId: user.id,
        isDeleted: false,
      },
    };
  } else if (user && user.role === "SUB_ADMIN") {
    const managedSurveyors = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "SURVEY_PERSON",
        OR: [{ createdBy: user.id }, { createdBy: null }]
      },
      select: { id: true }
    });
    const surveyorIds = managedSurveyors.map((s) => s.id);
    where.OR = [
      { createdBy: user.id },
      { assignments: { some: { surveyorId: { in: surveyorIds }, isDeleted: false } } }
    ];
  }

  const sites = await prisma.surveySite.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return sites.map(formatSurveySite);
};

const getSiteById = async (id) => {
  const site = await prisma.surveySite.findFirst({
    where: { id, isDeleted: false },
  });
  if (!site) throw new Error("Survey site not found.");
  return formatSurveySite(site);
};

const createSite = async (data) => {
  if (!data.siteId) {
    const count = await prisma.surveySite.count();
    const nextNum = (count + 1).toString().padStart(3, "0");
    data.siteId = `BSC${nextNum}`;
  } else {
    data.siteId = data.siteId.trim().toUpperCase();
  }
  const site = await prisma.surveySite.create({ data });
  return formatSurveySite(site);
};

const updateSite = async (id, data) => {
  const existing = await getSiteById(id);
  const site = await prisma.surveySite.update({
    where: { id: existing.id },
    data,
  });
  return formatSurveySite(site);
};

const deleteSite = async (id) => {
  const existing = await getSiteById(id);
  await prisma.surveySite.update({
    where: { id: existing.id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return true;
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
};
