const mongoose = require("mongoose");
const encodeUrl = require("encodeurl");

console.log("mongoose uri: " + process.env.MONGODB_URL);
const url = encodeUrl(process.env.MONGODB_URL);
console.log("This is encoded url: " + url);
// mongoose.connect(url, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   bufferCommands: false,
// });
