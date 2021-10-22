require("dotenv").config();
require("./database/mongoose/index");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { spawn } = require("child_process");
const kue = require("kue");
const { Queue } = require("kue");

let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const queue = kue.createQueue({
  redis: REDIS_URL,
});

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

app.post("/meiHistory", (req, res) => {
  if (!req.body.cnpj) {
    return res.status(400).send("You need to supply CNPJ parameter");
  }
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["scraper.py", req.body.cnpj]);

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

app.post("/paymentCode", (req, res) => {
  if (!req.body.monthYear) {
    return res.status(400).send("You need to supply monthYear parameter");
  }
  console.log("got paymentCode request");
  const job = queue
    .create("mytype", {
      letter: "a",
      title: "mytitle",
      cnpj: req.body.cnpj,
      monthYear: req.body.monthYear,
    })
    .removeOnComplete(true)
    .save((error) => {
      if (error) {
        next(error);
        return;
      }
      job.on("complete", (result) => {
        res.send(`Hello Intense ${result}`);
      });
      job.on("failed", () => {
        const failedError = new Error("failed");
        next(failedError);
      });
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
