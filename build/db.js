"use strict";
/**
 * This file was auto-generated using the Sensible Boilerplate Creator (npx create-sensible-app).
 * You can edit it in what ever way you see fit.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncModels = exports.sequelize = exports.getAllModels = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize_typescript_1 = require("sequelize-typescript");
const sensible_utilities_1 = require("./sensible-utilities");
const constants_1 = __importDefault(require("./constants"));
const RUN_STAGING = constants_1.default.RUN_STAGING; // 'true';
const isProd = RUN_STAGING === "false";
const connectionInfo = {
    database: isProd ? constants_1.default.DB_DB : constants_1.default.STAGING_DB_DB,
    username: isProd ? constants_1.default.DB_USER : constants_1.default.STAGING_DB_USER,
    password: isProd ? constants_1.default.DB_PASSWORD : constants_1.default.STAGING_DB_PASSWORD,
    dialectOptions: {
        host: isProd ? constants_1.default.DB_HOST : constants_1.default.STAGING_DB_HOST,
        port: "3306",
    },
};
const getAllModels = () => {
    return (0, sensible_utilities_1.importFromFiles)({
        files: (0, sensible_utilities_1.findFiles)("model", __dirname).map((x) => x.path),
        guard: (moduleExports) => typeof moduleExports === "function",
    });
};
exports.getAllModels = getAllModels;
exports.sequelize = new sequelize_typescript_1.Sequelize({
    dialect: "mysql",
    ...connectionInfo,
    //models: getAllModels(),
    benchmark: false,
    // for logging slow queries
    logQueryParameters: false,
    logging: (sql, timing) => {
        if (timing && timing > 200) {
            console.log(sql, timing);
        }
    },
});
const syncModels = async () => {
    //  console.log({ connectionInfo, isProd });
    try {
        const alter = true;
        console.log(`Syncing db (alter: ${alter})`);
        await exports.sequelize.authenticate();
        await exports.sequelize.sync({
            // logging: console.log,
            alter,
        });
        console.log("Synced");
    }
    catch (e) {
        console.log("e", e);
    }
};
exports.syncModels = syncModels;
