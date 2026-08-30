const express = require("express");

const port = 3000;
const wwwRoot = "/www";

const app = express();

app.disable("x-powered-by");

app.get("/healthz", (_req, res) => {
  res.type("text/plain").send("ok\n");
});

app.use(
  express.static(wwwRoot, {
    etag: false,
    fallthrough: false,
    index: "index.html",
    lastModified: false,
    setHeaders(res) {
      res.setHeader("Cache-Control", "no-store");
    }
  })
);

app.listen(port, () => {
  console.log(`Serving ${wwwRoot} on port ${port}`);
});
