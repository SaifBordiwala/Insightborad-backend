import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "path";

const envFile =
  process.env.DOTENV_CONFIG_PATH
    ? path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH)
    : path.resolve(process.cwd(), ".env");

config({ path: envFile, quiet: true });

// During build/generation, DATABASE_URL might not be available
// Prisma generate doesn't need a real connection, so we use a dummy URL if needed
const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
