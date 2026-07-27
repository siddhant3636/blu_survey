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
    include: {
      assignments: {
        where: { isDeleted: false },
        include: {
          surveyor: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    },
  });

  const getLatestAssignmentTime = (site) => {
    const activeAssignments = site.assignments || [];
    if (activeAssignments.length === 0) {
      return new Date(site.createdAt).getTime();
    }
    const dates = activeAssignments.map((a) => new Date(a.assignedDate).getTime());
    return Math.max(...dates);
  };

  sites.sort((a, b) => getLatestAssignmentTime(b) - getLatestAssignmentTime(a));

  return sites.map(formatSurveySite);
};

const getSiteById = async (id) => {
  const site = await prisma.surveySite.findFirst({
    where: { id, isDeleted: false },
    include: {
      assignments: {
        where: { isDeleted: false },
        include: {
          surveyor: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }
    },
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

const updateSite = async (id, data, user) => {
  const existing = await getSiteById(id);
  const { surveyorIds, ...siteData } = data;

  let newStatus = siteData.status || existing.status;
  if (surveyorIds !== undefined) {
    if (surveyorIds.length > 0 && newStatus === "PENDING") {
      newStatus = "ASSIGNED";
    } else if (surveyorIds.length === 0 && newStatus === "ASSIGNED") {
      newStatus = "PENDING";
    }
  }

  const site = await prisma.surveySite.update({
    where: { id: existing.id },
    data: {
      ...siteData,
      status: newStatus
    },
  });

  if (surveyorIds !== undefined) {
    const activeAssignments = await prisma.surveyAssignment.findMany({
      where: { surveySiteId: id, isDeleted: false }
    });
    const activeSurveyorIds = activeAssignments.map((a) => a.surveyorId);

    const toRemove = activeSurveyorIds.filter((sId) => !surveyorIds.includes(sId));
    if (toRemove.length > 0) {
      await prisma.surveyAssignment.updateMany({
        where: {
          surveySiteId: id,
          surveyorId: { in: toRemove }
        },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    }

    for (const sId of surveyorIds) {
      const existingAssignment = await prisma.surveyAssignment.findFirst({
        where: { surveySiteId: id, surveyorId: sId }
      });

      if (existingAssignment) {
        if (existingAssignment.isDeleted) {
          await prisma.surveyAssignment.update({
            where: { id: existingAssignment.id },
            data: {
              isDeleted: false,
              deletedAt: null,
              status: "ASSIGNED",
              assignedDate: new Date(),
              createdBy: user?.id || null
            }
          });
        }
      } else {
        await prisma.surveyAssignment.create({
          data: {
            surveySiteId: id,
            surveyorId: sId,
            createdBy: user?.id || null
          }
        });
      }
    }
  }

  return getSiteById(id);
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
