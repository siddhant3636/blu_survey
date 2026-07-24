const { prisma } = require("../../config/database");

const getSettings = async () => {
  return prisma.settings.findMany();
};

const updateSetting = async (key, value) => {
  return prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
};

module.exports = {
  getSettings,
  updateSetting,
};
