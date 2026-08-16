const { createApp } = require("./src/app");
const prisma = require("./src/db/prisma");
const logger = require("./src/logger");
const { ensureSeedTodos } = require("./src/services/todoSeedService");
const natsService = require("./src/services/natsService");

const port = Number(process.env.PORT) || 3000;
const app = createApp();

const start = async () => {
  await ensureSeedTodos();

  const server = app.listen(port, () => {
    logger.info("Server started", { port });
  });

  const shutdown = async () => {
    server.close(async () => {
      logger.info("Server shutting down");
      await natsService.close();
      await logger.flush();
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch(async (error) => {
  logger.error("Failed to start server", { error });
  await natsService.close();
  await logger.flush();
  await prisma.$disconnect();
  process.exit(1);
});
