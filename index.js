const { getMeiHistory, getPaymentCode, readPdfFile } = require("./server.js");
require("dotenv").config();
console.log(process.env);
require("./database/mongoose/index");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const maxConc = process.env.MAX_CONCURRENCY || 1;
console.log("got hereee");
const { spawn } = require("child_process");
const { Cluster } = require("puppeteer-cluster");

// let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// const queue = kue.createQueue({
//   redis: REDIS_URL,
// });
// queue.on("error", function (err) {
//   console.log("Error creating REDIS queue. " + err);
// });

// --------------------------------------------------------------------
// PARSE JSON
// --------------------------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------

const UserRouter = require("./database/routers/user");
const proxy = "";
app.use(proxy, UserRouter);

app.get("/", (req, res) => {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["scraper.py", "38294699000112"]);

  // collect data from script
  python.stdout.on("data", function (data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
  });

  python.on("error", function (err) {
    console.log("There was an error while pipeing data: " + err);
    res.send(err);
  });
  // in close event we are sure that stream from child process is closed
  python.on("close", (code, signal) => {
    console.log(
      `child process close all stdio with code ${code} and signal ${signal}`
    );
    // send data to browser
    res.send(dataToSend);
  });
});

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
  const { success, data, requestDurationSeconds, error } = await getPaymentCode(
    req.body.monthYear,
    req.body.cnpj
  );
  if (success) {
    console.log("Sucess getting payment code !");
    res.status(200).send({ data, requestDurationSeconds });
  } else {
    res.status(500).send({ error });
  }
});

let python;
app.post("/sendCommand", (req, res) => {
  if (!req.body.command) {
    return res.status(400).send("You must specify a 'command' in the body !");
  }
  if (!python) {
    initializePython();
    // return res
    //   .status(503)
    //   .send(
    //     "driver instance not found ! re-initializing python. Wait several seconds and try again."
    //   );
  }
  console.log("Sending command.");
  //attachListeners(req, res, python);
  python.stdout.on("data", function cb(data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
    if (data.toString().includes("Close now.")) {
      //python.stdout.on("data", () => {});
      python.stdout.removeListener("data", cb);
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(dataToSend);
    }
  });
  python.stdin.setEncoding("utf-8");

  python.stdin.cork();
  python.stdin.write(`${req.body.command}\n`);
  python.stdin.uncork();
});
app.post("/initPython", (req, res) => {
  initializePython();
  res.status(200).send("Initialize command sent.");
});

async function initializePython() {
  //await fkill("Chrome");
  //console.log("Killed Chrome");
  console.log("Initializing python.");
  python = spawn("python", ["server.py"], { detached: true });
  python.unref();
  //python.stdout.pipe(process.stdout);
}

function attachListeners(req, res, python) {
  // collect data from script
  // python.stdout.on("data", function (data) {
  //   console.log("Pipe data from python script ...");
  //   dataToSend = data.toString();
  //   if (data.toString().includes("Close now.")) {
  //     python.stdout.on("data", () => {});
  //     res.setHeader("Content-Type", "application/json");
  //     res.writeHead(200);
  //     res.end(dataToSend);
  //   }
  // });
  // python.on("error", function (err) {
  //   console.log("There was an error while pipeing data: " + err);
  //   res.send(err);
  // });
  // // in close event we are sure that stream from child process is closed
  // python.on("close", (code, signal) => {
  //   console.log(
  //     `child process close all stdio with code ${code} and signal ${signal}`
  //   );
  //   // send data to browser
  //   res.send(dataToSend);
  // });
}

app.post("/readPdfFile", async (req, res) => {
  if (!req.body.cnpj) {
    return res
      .status(400)
      .send("You need to supply monthYear and cnpj parameters!");
  }
  const { success, res1, res2, res3, res4 } = await readPdfFile();
  if (success) {
    res.status(200).send({
      success,
      res1,
      res2,
      res3,
      res4,
    });
  } else {
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
      const { success, data, requestDurationSeconds, error } =
        await getMeiHistory(cnpj);
      return {
        success,
        data,
        requestDurationSeconds,
        error,
      };
    } catch (err) {
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
    } catch (err) {
      //
      res.status(500).send("weird error !");
    }
  });

  app.listen(port, () => {
    console.log(
      `Example app listening at http://localhost:${port}. Max concurrency: ${maxConc}`
    );
  });
})();
