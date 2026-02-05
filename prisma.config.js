"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const config_1 = require("prisma/config");
const path_1 = __importDefault(require("path"));
const envFile = process.env.DOTENV_CONFIG_PATH
    ? path_1.default.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH)
    : path_1.default.resolve(process.cwd(), ".env");
(0, dotenv_1.config)({ path: envFile, quiet: true });
// During build/generation, DATABASE_URL might not be available
// Prisma generate doesn't need a real connection, so we use a dummy URL if needed
const databaseUrl = process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    datasource: {
        url: databaseUrl,
    },
});
//# sourceMappingURL=prisma.config.js.map