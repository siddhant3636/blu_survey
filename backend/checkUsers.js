const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Registered Users in Database:");
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error reading users:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
