const { prisma } = require("../../config/database");
const { hashPassword } = require("../../utils/encryption");
const { formatUserObj } = require("./user.helper");

const getAllUsers = async (roleFilter) => {
  const users = await prisma.user.findMany({
    where: { 
      isDeleted: false,
      ...(roleFilter ? { role: roleFilter } : {})
    },
    include: {
      assignments: {
        where: { isDeleted: false },
        include: { surveySite: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });
  return users.map(formatUserObj);
};

const getUserById = async (id) => {
  const user = await prisma.user.findFirst({
    where: { id, isDeleted: false },
    include: {
      assignments: {
        where: { isDeleted: false },
        include: { surveySite: true }
      }
    },
  });
  if (!user) throw new Error("User not found.");
  return formatUserObj(user);
};

const createUser = async (data) => {
  const { siteIds, ...userData } = data;

  if (userData.email) {
    userData.email = userData.email.trim().toLowerCase();
  }
  if (userData.name) {
    userData.name = userData.name.trim();
  }
  if (userData.phone) {
    userData.phone = userData.phone.trim();
  }

  const existing = await prisma.user.findUnique({ where: { email: userData.email } });
  if (existing && !existing.isDeleted) {
    const err = new Error("Email address is already taken by another user.");
    err.statusCode = 409;
    throw err;
  }

  // Validate siteIds existence
  const uniqueSiteIds = siteIds && Array.isArray(siteIds) ? [...new Set(siteIds)] : [];
  if (uniqueSiteIds.length > 0) {
    const validSites = await prisma.surveySite.findMany({
      where: { id: { in: uniqueSiteIds }, isDeleted: false },
      select: { id: true },
    });
    if (validSites.length !== uniqueSiteIds.length) {
      const err = new Error("One or more selected site IDs are invalid or non-existent.");
      err.statusCode = 404;
      throw err;
    }
  }

  let plainPassword = userData.password;
  if (!plainPassword || plainPassword.trim() === "") {
    if (userData.phone && userData.phone.trim() !== "") {
      plainPassword = userData.phone.trim();
    } else {
      plainPassword = "BluSmart@123";
    }
  }

  const hashedPassword = await hashPassword(plainPassword);
  let userObj;

  if (existing && existing.isDeleted) {
    userObj = await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...userData,
        password: hashedPassword,
        isDeleted: false,
        deletedAt: null,
        isActive: true,
      },
    });
  } else {
    userObj = await prisma.user.create({
      data: { ...userData, password: hashedPassword },
    });
  }

  // Create assignments for mapped siteIds
  if (uniqueSiteIds.length > 0) {
    for (const siteId of uniqueSiteIds) {
      await prisma.surveyAssignment.create({
        data: {
          surveySiteId: siteId,
          surveyorId: userObj.id,
          status: "ASSIGNED",
        },
      });
    }
  }

  return getUserById(userObj.id);
};

const updateUser = async (id, data) => {
  const existing = await getUserById(id);

  const allowedFields = ["name", "email", "phone", "role", "password", "isActive"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (updateData.name && typeof updateData.name === "string") {
    updateData.name = updateData.name.trim();
  }

  if (updateData.phone && typeof updateData.phone === "string") {
    updateData.phone = updateData.phone.trim();
  }

  if (updateData.email && typeof updateData.email === "string") {
    updateData.email = updateData.email.trim().toLowerCase();
    if (updateData.email !== existing.email) {
      const emailUser = await prisma.user.findUnique({ where: { email: updateData.email } });
      if (emailUser && !emailUser.isDeleted && emailUser.id !== existing.id) {
        const err = new Error("Email address is already taken by another user.");
        err.statusCode = 409;
        throw err;
      }
    }
  }

  if (updateData.password) {
    if (typeof updateData.password === "string" && updateData.password.trim() === "") {
      delete updateData.password;
    } else {
      updateData.password = await hashPassword(updateData.password);
    }
  }

  // Validate siteIds existence if provided
  let uniqueSiteIds = null;
  if (data.siteIds !== undefined && Array.isArray(data.siteIds)) {
    uniqueSiteIds = [...new Set(data.siteIds)];
    if (uniqueSiteIds.length > 0) {
      const validSites = await prisma.surveySite.findMany({
        where: { id: { in: uniqueSiteIds }, isDeleted: false },
        select: { id: true },
      });
      if (validSites.length !== uniqueSiteIds.length) {
        const err = new Error("One or more selected site IDs are invalid or non-existent.");
        err.statusCode = 404;
        throw err;
      }
    }
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  // Update multi-site assignments if siteIds is provided
  if (uniqueSiteIds !== null) {
    // Soft-delete obsolete assignments for this user
    await prisma.surveyAssignment.updateMany({
      where: { surveyorId: existing.id, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    for (const siteId of uniqueSiteIds) {
      const existingAssign = await prisma.surveyAssignment.findFirst({
        where: { surveyorId: existing.id, surveySiteId: siteId },
      });
      if (existingAssign) {
        await prisma.surveyAssignment.update({
          where: { id: existingAssign.id },
          data: { isDeleted: false, deletedAt: null, status: "ASSIGNED" },
        });
      } else {
        await prisma.surveyAssignment.create({
          data: {
            surveySiteId: siteId,
            surveyorId: existing.id,
            status: "ASSIGNED",
          },
        });
      }

      await prisma.surveySite.update({
        where: { id: siteId },
        data: { status: "ASSIGNED" },
      });
    }
  }

  return getUserById(existing.id);
};

const deleteUser = async (id) => {
  const existing = await getUserById(id);
  await prisma.user.update({
    where: { id: existing.id },
    data: { isDeleted: true, deletedAt: new Date(), isActive: false },
  });
  return true;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
