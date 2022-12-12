/**
 * This file was auto-generated using the Sensible Boilerplate Creator (npx create-sensible-app).
 * You can edit it in what ever way you see fit.
 */

import dotenv from "dotenv";
dotenv.config();
import { Options } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { findFiles, importFromFiles } from "./sensible-utilities";
import Constants from "./constants";
const RUN_STAGING = Constants.RUN_STAGING; // 'true';
const isProd = RUN_STAGING === "false";

const connectionInfo = {
  database: isProd ? Constants.DB_DB : Constants.STAGING_DB_DB,
  username: isProd ? Constants.DB_USER : Constants.STAGING_DB_USER,
  password: isProd ? Constants.DB_PASSWORD : Constants.STAGING_DB_PASSWORD,
  dialectOptions: {
    host: isProd ? Constants.DB_HOST : Constants.STAGING_DB_HOST,
    port: "3306",
  },
};

export const getAllModels = () => {
  return importFromFiles({
    files: findFiles("model", __dirname).map((x) => x.path),
    /** to be imported, the export has to be a function */
    guard: (moduleExports) => typeof moduleExports === "function",
  });
};

console.log({ __dirname });
export const sequelize = new Sequelize({
  dialect: "mysql",
  ...connectionInfo,
  //models: [__dirname + "/User"], // or [Player, Team],
  models: getAllModels(),
  benchmark: false,
  // for logging slow queries
  logQueryParameters: false,
  logging: (sql, timing) => {
    if (timing && timing > 200) {
      console.log(sql, timing);
    }
  },
});

export const syncModels = async () => {
  //  console.log({ connectionInfo, isProd });
  try {
    const alter = true;
    console.log(`Syncing db (alter: ${alter})`);
    await sequelize.authenticate();
    await sequelize.sync({
      // logging: console.log,
      alter,
    });
    console.log("Synced");
  } catch (e) {
    console.log("e", e);
  }
};
