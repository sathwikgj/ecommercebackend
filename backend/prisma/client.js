// prisma/client.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // optional (helps debugging)
});

module.exports = prisma;