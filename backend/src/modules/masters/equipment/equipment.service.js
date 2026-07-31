const { prisma } = require("../../../config/database");

const getEquipments = async (options = {}) => {
  const where = { isDeleted: false };
  if (options.activeOnly) {
    where.isActive = true;
  }

  return prisma.equipment.findMany({
    where,
    orderBy: { name: "asc" },
  });
};

const getEquipmentById = async (id) => {
  const equipment = await prisma.equipment.findFirst({
    where: { id, isDeleted: false },
  });
  if (!equipment) throw new Error("Equipment not found.");
  return equipment;
};

const createEquipment = async (data) => {
  const name = data.name ? data.name.trim() : "";
  const description = data.description ? data.description.trim() : null;
  if (!name) throw new Error("Equipment entry name is required.");

  const existing = await prisma.equipment.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      description: description ? { equals: description, mode: "insensitive" } : null,
    },
  });

  if (existing) {
    if (existing.isDeleted) {
      return prisma.equipment.update({
        where: { id: existing.id },
        data: { name, description, isDeleted: false, isActive: true },
      });
    }
    throw new Error(`Equipment entry '${name}' already exists.`);
  }

  return prisma.equipment.create({
    data: {
      name,
      description,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
};

const updateEquipment = async (id, data) => {
  const existing = await getEquipmentById(id);
  const updateData = {};

  const name = data.name !== undefined ? data.name.trim() : existing.name;
  const description = data.description !== undefined ? (data.description ? data.description.trim() : null) : existing.description;

  if (data.name !== undefined || data.description !== undefined) {
    if (!name) throw new Error("Equipment name cannot be empty.");

    const duplicate = await prisma.equipment.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        description: description ? { equals: description, mode: "insensitive" } : null,
        id: { not: id },
        isDeleted: false,
      },
    });
    if (duplicate) throw new Error(`Equipment entry '${name}' already exists.`);
    
    if (data.name !== undefined) updateData.name = name;
    if (data.description !== undefined) updateData.description = description;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  return prisma.equipment.update({
    where: { id: existing.id },
    data: updateData,
  });
};

const toggleEquipmentStatus = async (id) => {
  const existing = await getEquipmentById(id);
  return prisma.equipment.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });
};

const deleteEquipment = async (id) => {
  const existing = await getEquipmentById(id);
  return prisma.equipment.update({
    where: { id: existing.id },
    data: { isDeleted: true, isActive: false },
  });
};

module.exports = {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  toggleEquipmentStatus,
  deleteEquipment,
};
