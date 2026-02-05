import { config } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "path";

const envFile =
  process.env.DOTENV_CONFIG_PATH
    ? path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH)
    : process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "env/production.env")
      : path.resolve(process.cwd(), "env/local.env");

config({ path: envFile, quiet: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
