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
    : process.env.NODE_ENV === "production"
        ? path_1.default.resolve(process.cwd(), "env/production.env")
        : path_1.default.resolve(process.cwd(), "env/local.env");
(0, dotenv_1.config)({ path: envFile, quiet: true });
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
//# sourceMappingURL=prisma.config.js.map