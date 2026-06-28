const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
let requests = 0;

app.get("/", (_req, res) => {
    requests++;
    res.send(`pong ${requests}`);
});

app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
});
