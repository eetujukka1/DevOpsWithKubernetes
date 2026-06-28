const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const string = crypto.randomUUID();

app.get("/", (_req, res) => {
    res.send(`${new Date().toISOString()}: ${string}`);
});

app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
});
