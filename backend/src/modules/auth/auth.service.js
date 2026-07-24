const { prisma } = require("../../config/database");
const { comparePassword, hashPassword } = require("../../utils/encryption");
const { generateTokens } = require("./auth.utils");

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials or deactivated account.");
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials.");
  }

  const tokens = generateTokens(user);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ...tokens,
  };
};

const register = async (userData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error("Email already registered.");
  }

  const hashedPassword = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  const tokens = generateTokens(user);
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ...tokens,
  };
};

module.exports = {
  login,
  register,
};
