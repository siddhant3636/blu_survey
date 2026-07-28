const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting data clearing process...");
  try {
    // Delete transient tables in reverse order of foreign key dependency
    const deletePhotos = prisma.photo.deleteMany();
    const deleteDGs = prisma.dG.deleteMany();
    const deleteTransformers = prisma.transformer.deleteMany();
    const deletePanels = prisma.panel.deleteMany();
    const deleteChargers = prisma.charger.deleteMany();
    const deleteSurveys = prisma.survey.deleteMany();
    const deleteAssignments = prisma.surveyAssignment.deleteMany();
    const deleteSites = prisma.surveySite.deleteMany();

    await prisma.$transaction([
      deletePhotos,
      deleteDGs,
      deleteTransformers,
      deletePanels,
      deleteChargers,
      deleteSurveys,
      deleteAssignments,
      deleteSites
    ]);

    console.log("Successfully cleared transient survey data, assignments, sites, and asset checklists.");
  } catch (err) {
    console.error("Error clearing data:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
