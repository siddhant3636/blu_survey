const { prisma } = require("../../../config/database");

const getManufacturers = async (options = {}) => {
  const where = { isDeleted: false };
  if (options.activeOnly) {
    where.isActive = true;
  }

  return prisma.chargerManufacturer.findMany({
    where,
    include: {
      models: {
        where: options.activeOnly ? { isDeleted: false, isActive: true } : { isDeleted: false },
      },
    },
    orderBy: { name: "asc" },
  });
};

const getManufacturerById = async (id) => {
  const mfg = await prisma.chargerManufacturer.findFirst({
    where: { id, isDeleted: false },
    include: { models: { where: { isDeleted: false } } },
  });
  if (!mfg) throw new Error("Manufacturer not found.");
  return mfg;
};

const createManufacturer = async (data) => {
  const name = data.name ? data.name.trim() : "";
  if (!name) throw new Error("Manufacturer name is required.");

  const existing = await prisma.chargerManufacturer.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    if (existing.isDeleted) {
      return prisma.chargerManufacturer.update({
        where: { id: existing.id },
        data: { name, isDeleted: false, isActive: true },
      });
    }
    throw new Error(`Manufacturer '${name}' already exists.`);
  }

  return prisma.chargerManufacturer.create({
    data: {
      name,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
};

const updateManufacturer = async (id, data) => {
  const existing = await getManufacturerById(id);
  const updateData = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error("Manufacturer name cannot be empty.");

    const duplicate = await prisma.chargerManufacturer.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: id },
        isDeleted: false,
      },
    });
    if (duplicate) throw new Error(`Manufacturer '${name}' already exists.`);
    updateData.name = name;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  return prisma.chargerManufacturer.update({
    where: { id: existing.id },
    data: updateData,
  });
};

const toggleManufacturerStatus = async (id) => {
  const existing = await getManufacturerById(id);
  return prisma.chargerManufacturer.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });
};

const deleteManufacturer = async (id) => {
  const existing = await getManufacturerById(id);
  return prisma.chargerManufacturer.update({
    where: { id: existing.id },
    data: { isDeleted: true, isActive: false },
  });
};

module.exports = {
  getManufacturers,
  getManufacturerById,
  createManufacturer,
  updateManufacturer,
  toggleManufacturerStatus,
  deleteManufacturer,
};
