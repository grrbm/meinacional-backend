require("dotenv").config();
require("./database/mongoose/index");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { spawn } = require("child_process");
const kue = require("kue");
const { Queue } = require("kue");
const bodyParser = require("body-parser");

let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const queue = kue.createQueue({
  redis: REDIS_URL,
});

// --------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------

const UserRouter = require("./database/routers/user");
const proxy = "";
app.use(proxy, UserRouter);

app.get("/", (req, res) => {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["scraper.py"]);

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
  console.log("got paymendCode request");
  const job = queue
    .create("mytype", {
      letter: "a",
      title: "mytitle",
      monthYear: req.body.monthYear,
      job: jobToPerform,
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

//----------------FUNCTION------------------------------

function jobToPerform() {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["print.payment.py"]);

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
}
