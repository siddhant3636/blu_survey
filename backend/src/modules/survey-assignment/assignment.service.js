
const { prisma } = require("../../config/database");

const getAllAssignments = async (user) => {
  let where = { isDeleted: false };

  if (user && (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR")) {
    where.surveyorId = user.id;
  }

  return prisma.surveyAssignment.findMany({
    where,
    include: {
      surveyor: {
        select: { id: true, name: true, email: true, role: true },
      },
      surveySite: true,
    },
    orderBy: { assignedDate: "desc" },
  });
};

const getAssignmentsForSurveyor = async (surveyorId) => {
  return prisma.surveyAssignment.findMany({
    where: { surveyorId, isDeleted: false },
    include: {
      surveySite: true,
    },
    orderBy: { assignedDate: "desc" },
  });
};

const createAssignment = async (data, user) => {
  const { surveySiteId, surveyorId, surveyorIds } = data;
  const idsToAssign = surveyorIds && surveyorIds.length > 0 ? surveyorIds : surveyorId ? [surveyorId] : [];

  if (idsToAssign.length === 0) {
    throw new Error("At least one Survey Person must be selected.");
  }

  // Retrieve active assignments to clean up deselected ones
  const activeAssignments = await prisma.surveyAssignment.findMany({
    where: { surveySiteId, isDeleted: false }
  });
  const activeSurveyorIds = activeAssignments.map((a) => a.surveyorId);

  const toRemove = activeSurveyorIds.filter((sId) => !idsToAssign.includes(sId));
  if (toRemove.length > 0) {
    await prisma.surveyAssignment.updateMany({
      where: {
        surveySiteId,
        surveyorId: { in: toRemove }
      },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }

  const createdAssignments = [];

  for (const sId of idsToAssign) {
    const existing = await prisma.surveyAssignment.findFirst({
      where: {
        surveySiteId,
        surveyorId: sId,
      },
    });

    if (existing) {
      if (existing.isDeleted) {
        const updated = await prisma.surveyAssignment.update({
          where: { id: existing.id },
          data: {
            isDeleted: false,
            deletedAt: null,
            status: "ASSIGNED",
            createdBy: user?.id || null,
            assignedDate: new Date(),
          },
          include: {
            surveyor: { select: { id: true, name: true, email: true } },
            surveySite: true,
          },
        });
        createdAssignments.push(updated);
      } else {
        // Keep active assignments unchanged to protect their progress
        const loaded = await prisma.surveyAssignment.findUnique({
          where: { id: existing.id },
          include: {
            surveyor: { select: { id: true, name: true, email: true } },
            surveySite: true,
          },
        });
        createdAssignments.push(loaded);
      }
    } else {
      const created = await prisma.surveyAssignment.create({
        data: {
          surveySiteId,
          surveyorId: sId,
          createdBy: user?.id || null,
        },
        include: {
          surveyor: { select: { id: true, name: true, email: true } },
          surveySite: true,
        },
      });
      createdAssignments.push(created);
    }
  }

  // Update site status to ASSIGNED if pending
  const site = await prisma.surveySite.findUnique({ where: { id: surveySiteId } });
  if (site && site.status === "PENDING") {
    await prisma.surveySite.update({
      where: { id: surveySiteId },
      data: { status: "ASSIGNED" },
    });
  }

  return createdAssignments;
};

const updateAssignmentStatus = async (id, status, user) => {
  const assignment = await prisma.surveyAssignment.findUnique({
    where: { id },
  });
  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  // Authorize: Only the assigned surveyor or an admin/sub-admin/manager can modify
  const isAdmin = user.role === "ADMIN" || user.role === "SUB_ADMIN" || user.role === "MANAGER";
  if (!isAdmin && assignment.surveyorId !== user.id) {
    const err = new Error("Access denied. You are not authorized to update this assignment.");
    err.statusCode = 403;
    throw err;
  }

  return prisma.surveyAssignment.update({
    where: { id },
    data: { status },
  });
};

const deleteAssignment = async (id, user) => {
  const assignment = await prisma.surveyAssignment.findUnique({
    where: { id },
  });
  if (!assignment) throw new Error("Assignment not found.");

  // SUB_ADMIN can delete assignments similar to ADMIN

  await prisma.surveyAssignment.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  const activeCount = await prisma.surveyAssignment.count({
    where: { surveySiteId: assignment.surveySiteId, isDeleted: false },
  });

  if (activeCount === 0) {
    await prisma.surveySite.update({
      where: { id: assignment.surveySiteId },
      data: { status: "PENDING" },
    });
  }

  return true;
};

module.exports = {
  getAllAssignments,
  getAssignmentsForSurveyor,
  createAssignment,
  updateAssignmentStatus,
  deleteAssignment,
};
