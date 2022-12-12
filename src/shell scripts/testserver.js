const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

// --------------------------------------------------------------------
// PARSE JSON
// --------------------------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------

app.post("/example", async (req, res) => {
  return res.status(200).send("Worked!\n");
});

// --------------------------------------------------------------------
// LISTEN
// --------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
