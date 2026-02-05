/**
 * Load env first, before any other app code that reads process.env.
 * Must be the first import in server.ts.
 */
import path from "path";
import { config } from "dotenv";

const envFile =
  process.env.DOTENV_CONFIG_PATH
    ? path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH)
    : path.resolve(process.cwd(), ".env");

config({ path: envFile, quiet: true });
