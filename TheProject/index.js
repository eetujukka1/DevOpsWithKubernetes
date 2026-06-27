const express = require("express");

const port = process.env.PORT || 3000;
const app = express();

app.get("*", (_req, res) => {
  res.send("Todo app");
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
