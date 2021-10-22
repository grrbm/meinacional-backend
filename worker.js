const kue = require("kue");
const { spawn } = require("child_process");

const { REDIS_URL } = process.env;

try {
  const queue = kue.createQueue({
    redis: REDIS_URL,
  });
  queue.process("mytype", async (job, done) => {
    switch (job.data.letter) {
      case "a":
        const result = await jobToPerform(job.data.cnpj, job.data.monthYear);
        done(null, "apple " + result);
        break;
      default:
        done(null, "unknown");
    }
  });
} catch (error) {
  console.log(error);
}

async function jobToPerform(cnpj, monthYear) {
  return new Promise((resolve, reject) => {
    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn("python", ["print.payment.py", cnpj, monthYear]);

    // collect data from script
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString();
    });

    python.on("error", function (err) {
      console.log("There was an error while pipeing data: " + err);
      reject(err);
    });
    // in close event we are sure that stream from child process is closed
    python.on("close", (code, signal) => {
      console.log(
        `child process close all stdio with code ${code} and signal ${signal}`
      );
      // send data to browser
      resolve(dataToSend);
    });
  });
}
