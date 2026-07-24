const { prisma } = require("../../../config/database");

const getModelsByManufacturer = async (manufacturerId, options = {}) => {
  const where = {
    isDeleted: false,
    ...(manufacturerId ? { manufacturerId } : {}),
  };
  if (options.activeOnly) {
    where.isActive = true;
  }

  return prisma.chargerModel.findMany({
    where,
    include: { manufacturer: true },
    orderBy: { name: "asc" },
  });
};

const getModelById = async (id) => {
  const model = await prisma.chargerModel.findFirst({
    where: { id, isDeleted: false },
    include: { manufacturer: true },
  });
  if (!model) throw new Error("Charger Model not found.");
  return model;
};

const createModel = async (data) => {
  const name = data.name ? data.name.trim() : "";
  const powerRating = data.powerRating ? data.powerRating.trim() : "";
  const manufacturerId = data.manufacturerId ? data.manufacturerId.trim() : "";

  if (!name) throw new Error("Model name is required.");
  if (!manufacturerId) throw new Error("Manufacturer is required.");
  if (!powerRating) throw new Error("Power rating is required.");

  // Verify manufacturer exists
  const mfg = await prisma.chargerManufacturer.findFirst({
    where: { id: manufacturerId, isDeleted: false },
  });
  if (!mfg) throw new Error("Selected manufacturer does not exist or is deleted.");

  const existing = await prisma.chargerModel.findFirst({
    where: {
      manufacturerId,
      name: { equals: name, mode: "insensitive" },
    },
  });

  if (existing) {
    if (existing.isDeleted) {
      return prisma.chargerModel.update({
        where: { id: existing.id },
        data: { name, powerRating, isDeleted: false, isActive: true },
      });
    }
    throw new Error(`Model '${name}' already exists for this manufacturer.`);
  }

  return prisma.chargerModel.create({
    data: {
      manufacturerId,
      name,
      powerRating,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
};

const updateModel = async (id, data) => {
  const existing = await getModelById(id);
  const updateData = {};

  if (data.name !== undefined || data.manufacturerId !== undefined) {
    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const manufacturerId = data.manufacturerId !== undefined ? data.manufacturerId.trim() : existing.manufacturerId;

    if (!name) throw new Error("Model name cannot be empty.");
    if (!manufacturerId) throw new Error("Manufacturer cannot be empty.");

    const mfg = await prisma.chargerManufacturer.findFirst({
      where: { id: manufacturerId, isDeleted: false },
    });
    if (!mfg) throw new Error("Selected manufacturer does not exist.");

    const duplicate = await prisma.chargerModel.findFirst({
      where: {
        manufacturerId,
        name: { equals: name, mode: "insensitive" },
        id: { not: id },
        isDeleted: false,
      },
    });
    if (duplicate) throw new Error(`Model '${name}' already exists for this manufacturer.`);

    updateData.name = name;
    updateData.manufacturerId = manufacturerId;
  }

  if (data.powerRating !== undefined) {
    const powerRating = data.powerRating.trim();
    if (!powerRating) throw new Error("Power rating cannot be empty.");
    updateData.powerRating = powerRating;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  return prisma.chargerModel.update({
    where: { id: existing.id },
    data: updateData,
    include: { manufacturer: true },
  });
};

const toggleModelStatus = async (id) => {
  const existing = await getModelById(id);
  return prisma.chargerModel.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
    include: { manufacturer: true },
  });
};

const deleteModel = async (id) => {
  const existing = await getModelById(id);
  return prisma.chargerModel.update({
    where: { id: existing.id },
    data: { isDeleted: true, isActive: false },
  });
};

module.exports = {
  getModelsByManufacturer,
  getModelById,
  createModel,
  updateModel,
  toggleModelStatus,
  deleteModel,
};
