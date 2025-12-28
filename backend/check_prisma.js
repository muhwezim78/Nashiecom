const prisma = require("./src/config/database");
console.log("Keys:", Object.keys(prisma));
console.log(
  "Models available:",
  Object.keys(prisma).filter((k) => !k.startsWith("$") && !k.startsWith("_"))
);
process.exit(0);
