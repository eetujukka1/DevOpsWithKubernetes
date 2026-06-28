const express = require("express");
const path = require("path");

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
