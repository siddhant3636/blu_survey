const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("Generating database backup...");
  try {
    const backup = {
      users: await prisma.user.findMany(),
      surveySites: await prisma.surveySite.findMany(),
      surveyAssignments: await prisma.surveyAssignment.findMany(),
      surveys: await prisma.survey.findMany(),
      chargers: await prisma.charger.findMany(),
      panels: await prisma.panel.findMany(),
      transformers: await prisma.transformer.findMany(),
      dgs: await prisma.dG.findMany(),
      photos: await prisma.photo.findMany(),
      chargerManufacturers: await prisma.chargerManufacturer.findMany(),
      chargerModels: await prisma.chargerModel.findMany(),
      connectors: await prisma.connector.findMany(),
      equipments: await prisma.equipment.findMany(),
      photoCategories: await prisma.photoCategory.findMany(),
      settings: await prisma.settings.findMany(),
      backupTimestamp: new Date().toISOString()
    };

    const backupPath = path.join(__dirname, "../../database_backup.json");
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`Backup successfully generated at: ${backupPath}`);
  } catch (err) {
    console.error("Failed to generate database backup:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
