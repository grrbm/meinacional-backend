"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const maxConc = process.env.MAX_CONCURRENCY || 1;
const { spawn } = require("child_process");
const { Cluster } = require("puppeteer-cluster");
const { syncModels } = require("./db");
// --------------------------------------------------------------------
// SYNC DATABASE
// --------------------------------------------------------------------
syncModels();
// --------------------------------------------------------------------
// PARSE JSON
// --------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// --------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------
//const UserRouter = require("./database/routers/user");
//const proxy = "";
//app.use(proxy, UserRouter);
// app.post("/meiHistory", async (req, res) => {
//   if (!req.body.cnpj) {
//     res.status(400).send("You need to supply CNPJ parameter");
//     return;
//   }
//   if (success) {
//     console.log("Sucess getting mei history !");
//     res.status(200).send({ data, requestDurationSeconds });
//   } else {
//     res.status(500).send({ error });
//   }
// });
app.post("/paymentCode", async (req, res) => {
    if (!req.body.monthYear || !req.body.cnpj) {
        return res
            .status(400)
            .send("You need to supply monthYear and cnpj parameters!");
    }
    console.log("got paymentCode request");
    const { success, data, requestDurationSeconds, error } = await (0, server_1.getPaymentCode)(req.body.monthYear, req.body.cnpj);
    if (success) {
        console.log("Sucess getting payment code !");
        res.status(200).send({ data, requestDurationSeconds });
    }
    else {
        res.status(500).send({ error });
    }
});
app.post("/readPdfFile", async (req, res) => {
    if (!req.body.cnpj) {
        return res
            .status(400)
            .send("You need to supply monthYear and cnpj parameters!");
    }
    const { success, res1, res2, res3, res4 } = await (0, server_1.readPdfFile)();
    if (success) {
        res.status(200).send({
            success,
            res1,
            res2,
            res3,
            res4,
        });
    }
    else {
        res.status(500).send("Theres Some Error !");
    }
});
(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: Number(maxConc),
    });
    // define your task (in this example we extract the title of the given page)
    await cluster.task(async ({ page, data: cnpj }) => {
        try {
            const { success, data, requestDurationSeconds, error } = await (0, server_1.getMeiHistory)(cnpj);
            return {
                success,
                data,
                requestDurationSeconds,
                error,
            };
        }
        catch (err) {
            //
            console.log("Some hard to debug error !");
            return {
                success: false,
                error: "Some hard to debug error !",
            };
        }
    });
    // Listen for the request
    app.post("/meiHistory", async function (req, res) {
        // cluster.execute will run the job with the workers in the pool. As there is only one worker
        // in the pool, the jobs will be run sequentially
        try {
            //
            const result = await cluster.execute(req.body.cnpj);
            res.status(200).send(result);
        }
        catch (err) {
            //
            res.status(500).send("weird error !");
        }
    });
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}. Max concurrency: ${maxConc}`);
    });
})();
