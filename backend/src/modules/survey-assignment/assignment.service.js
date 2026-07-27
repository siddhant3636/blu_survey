const { prisma } = require("../../config/database");

const getAllAssignments = async (user) => {
  let where = { isDeleted: false };

  if (user && user.role === "SUB_ADMIN") {
    const managedSurveyors = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "SURVEY_PERSON",
        OR: [{ createdBy: user.id }, { createdBy: null }]
      },
      select: { id: true }
    });
    const surveyorIds = managedSurveyors.map((s) => s.id);
    where.surveyorId = { in: surveyorIds };
  } else if (user && (user.role === "SURVEY_PERSON" || user.role === "SURVEYOR")) {
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

  // Security validation for SUB_ADMIN
  if (user && user.role === "SUB_ADMIN") {
    const managedSurveyors = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "SURVEY_PERSON",
        OR: [{ createdBy: user.id }, { createdBy: null }]
      },
      select: { id: true }
    });
    const managedIds = managedSurveyors.map((s) => s.id);
    const unauthorizedSelection = idsToAssign.some((id) => !managedIds.includes(id));
    if (unauthorizedSelection) {
      const err = new Error("Access denied. You cannot assign surveys to surveyors outside your control.");
      err.statusCode = 403;
      throw err;
    }
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
        // If it's already active, update its assignedDate to now to treat it as recent assignment activity
        const updated = await prisma.surveyAssignment.update({
          where: { id: existing.id },
          data: {
            assignedDate: new Date(),
          },
          include: {
            surveyor: { select: { id: true, name: true, email: true } },
            surveySite: true,
          },
        });
        createdAssignments.push(updated);
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
  await prisma.surveySite.update({
    where: { id: surveySiteId },
    data: { status: "ASSIGNED" },
  });

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

  if (user && user.role === "SUB_ADMIN") {
    const managedSurveyors = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: "SURVEY_PERSON",
        OR: [{ createdBy: user.id }, { createdBy: null }]
      },
      select: { id: true }
    });
    const managedIds = managedSurveyors.map((s) => s.id);
    if (!managedIds.includes(assignment.surveyorId)) {
      const err = new Error("Access denied. You cannot delete assignments for surveyors outside your control.");
      err.statusCode = 403;
      throw err;
    }
  }

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
