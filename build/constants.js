"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env = process.env;
const { STAGING_DB_DB, STAGING_DB_USER, STAGING_DB_PASSWORD, STAGING_DB_HOST, DB_DB, DB_USER, DB_PASSWORD, DB_HOST, RUN_STAGING, NODE_ENV, } = env;
const Constants = {
    STAGING_DB_DB,
    STAGING_DB_USER,
    STAGING_DB_PASSWORD,
    STAGING_DB_HOST,
    DB_DB,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    RUN_STAGING,
    NODE_ENV,
};
exports.default = Constants;
