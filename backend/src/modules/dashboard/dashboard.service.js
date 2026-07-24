const { prisma } = require("../../config/database");

const getStats = async () => {
  const [
    userCount,
    siteCount,
    pendingSiteCount,
    inProgressSiteCount,
    completedSiteCount,
    surveyCount,
    submittedSurveyCount,
    approvedSurveyCount,
    assignmentCount,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.surveySite.count({ where: { isDeleted: false } }),
    prisma.surveySite.count({ where: { isDeleted: false, status: "PENDING" } }),
    prisma.surveySite.count({ where: { isDeleted: false, status: "IN_PROGRESS" } }),
    prisma.surveySite.count({ where: { isDeleted: false, status: "COMPLETED" } }),
    prisma.survey.count({ where: { isDeleted: false } }),
    prisma.survey.count({ where: { isDeleted: false, status: "SUBMITTED" } }),
    prisma.survey.count({ where: { isDeleted: false, status: "APPROVED" } }),
    prisma.surveyAssignment.count({ where: { isDeleted: false } }),
  ]);

  const recentSurveys = await prisma.survey.findMany({
    where: { isDeleted: false },
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      surveySite: true,
      createdBySurveyor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    counts: {
      users: userCount,
      sites: siteCount,
      pendingSites: pendingSiteCount,
      inProgressSites: inProgressSiteCount,
      completedSites: completedSiteCount,
      surveys: surveyCount,
      submittedSurveys: submittedSurveyCount,
      approvedSurveys: approvedSurveyCount,
      assignments: assignmentCount,
    },
    recentSurveys,
  };
};

module.exports = {
  getStats,
};
