const { prisma } = require("../../../config/database");

const getConnectors = async (options = {}) => {
  const where = { isDeleted: false };
  if (options.activeOnly) {
    where.isActive = true;
  }

  return prisma.connector.findMany({
    where,
    orderBy: { type: "asc" },
  });
};

const getConnectorById = async (id) => {
  const connector = await prisma.connector.findFirst({
    where: { id, isDeleted: false },
  });
  if (!connector) throw new Error("Connector not found.");
  return connector;
};

const createConnector = async (data) => {
  const type = data.type ? data.type.trim() : "";
  if (!type) throw new Error("Connector type is required.");

  const existing = await prisma.connector.findFirst({
    where: { type: { equals: type, mode: "insensitive" } },
  });

  if (existing) {
    if (existing.isDeleted) {
      return prisma.connector.update({
        where: { id: existing.id },
        data: { type, isDeleted: false, isActive: true },
      });
    }
    throw new Error(`Connector type '${type}' already exists.`);
  }

  return prisma.connector.create({
    data: {
      type,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
};

const updateConnector = async (id, data) => {
  const existing = await getConnectorById(id);
  const updateData = {};

  if (data.type !== undefined) {
    const type = data.type.trim();
    if (!type) throw new Error("Connector type cannot be empty.");

    const duplicate = await prisma.connector.findFirst({
      where: {
        type: { equals: type, mode: "insensitive" },
        id: { not: id },
        isDeleted: false,
      },
    });
    if (duplicate) throw new Error(`Connector type '${type}' already exists.`);
    updateData.type = type;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  return prisma.connector.update({
    where: { id: existing.id },
    data: updateData,
  });
};

const toggleConnectorStatus = async (id) => {
  const existing = await getConnectorById(id);
  return prisma.connector.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });
};

const deleteConnector = async (id) => {
  const existing = await getConnectorById(id);
  return prisma.connector.update({
    where: { id: existing.id },
    data: { isDeleted: true, isActive: false },
  });
};

module.exports = {
  getConnectors,
  getConnectorById,
  createConnector,
  updateConnector,
  toggleConnectorStatus,
  deleteConnector,
};
