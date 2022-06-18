const { getMeiHistory } = require("./server.js");
require("dotenv").config();
require("./database/mongoose/index");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const { spawn } = require("child_process");
const kue = require("kue");
const { Queue } = require("kue");

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

app.post("/meiHistory", async (req, res) => {
  if (!req.body.cnpj) {
    return res.status(400).send("You need to supply CNPJ parameter");
  }

  const { success, data, requestDurationSeconds, error } = await getMeiHistory(
    req.body.cnpj
  );
  if (success) {
    console.log("Sucess getting mei history !");
    res.status(200).send({ data, requestDurationSeconds });
  } else {
    res.status(500).send({ error });
  }
});

app.post("/paymentCode", (req, res) => {
  // if (!req.body.monthYear) {
  //   return res.status(400).send("You need to supply monthYear parameter");
  // }
  // console.log("got paymentCode request");
  // const job = queue
  //   .create("mytype", {
  //     letter: "a",
  //     title: "mytitle",
  //     cnpj: req.body.cnpj,
  //     monthYear: req.body.monthYear,
  //   })
  //   .removeOnComplete(true)
  //   .save((error) => {
  //     if (error) {
  //       next(error);
  //       return;
  //     }
  //     job.on("complete", (result) => {
  //       res.send(`Hello Intense ${result}`);
  //     });
  //     job.on("failed", () => {
  //       const failedError = new Error("failed");
  //       next(failedError);
  //     });
  //   });
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
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
