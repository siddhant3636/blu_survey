const { prisma } = require("../../../config/database");

const getCategories = async (options = {}) => {
  const where = { isDeleted: false };
  if (options.activeOnly) {
    where.isActive = true;
  }

  return prisma.photoCategory.findMany({
    where,
    orderBy: { name: "asc" },
  });
};

const getCategoryById = async (id) => {
  const category = await prisma.photoCategory.findFirst({
    where: { id, isDeleted: false },
  });
  if (!category) throw new Error("Photo Category not found.");
  return category;
};

const createCategory = async (data) => {
  const name = data.name ? data.name.trim() : "";
  const description = data.description ? data.description.trim() : null;
  if (!name) throw new Error("Photo category name is required.");

  const existing = await prisma.photoCategory.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    if (existing.isDeleted) {
      return prisma.photoCategory.update({
        where: { id: existing.id },
        data: { name, description, isDeleted: false, isActive: true },
      });
    }
    throw new Error(`Photo category '${name}' already exists.`);
  }

  return prisma.photoCategory.create({
    data: {
      name,
      description,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    },
  });
};

const updateCategory = async (id, data) => {
  const existing = await getCategoryById(id);
  const updateData = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new Error("Category name cannot be empty.");

    const duplicate = await prisma.photoCategory.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: id },
        isDeleted: false,
      },
    });
    if (duplicate) throw new Error(`Photo category '${name}' already exists.`);
    updateData.name = name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description ? data.description.trim() : null;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  return prisma.photoCategory.update({
    where: { id: existing.id },
    data: updateData,
  });
};

const toggleCategoryStatus = async (id) => {
  const existing = await getCategoryById(id);
  return prisma.photoCategory.update({
    where: { id: existing.id },
    data: { isActive: !existing.isActive },
  });
};

const deleteCategory = async (id) => {
  const existing = await getCategoryById(id);
  return prisma.photoCategory.update({
    where: { id: existing.id },
    data: { isDeleted: true, isActive: false },
  });
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
};
