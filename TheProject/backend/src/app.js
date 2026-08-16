const express = require("express");

const logger = require("./logger");
const healthRouter = require("./routes/healthRouter");
const todoRouter = require("./routes/todoRouter");

const createApp = () => {
  const app = express();

  app.use(logger.requestLogger);
  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    return next();
  });

  app.use("/healthz", healthRouter);
  app.use("/api/health", healthRouter);
  app.use("/api/todos", todoRouter);

  app.use((error, _req, res, _next) => {
    logger.error("Unhandled request error", { error });
    res.status(500).json({ error: "Internal server error." });
  });

  return app;
};

module.exports = { createApp };
