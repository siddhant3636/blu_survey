const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('Admin@123', salt);

  const user = await prisma.user.upsert({
    where: { email: 'admin@blusmart.com' },
    update: {
      name: 'Admin',
      password,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: 'admin@blusmart.com',
      name: 'Admin',
      password,
      role: 'ADMIN',
    },
  });

  console.log(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    password: 'Admin@123'
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
