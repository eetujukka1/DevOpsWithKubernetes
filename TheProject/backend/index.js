const express = require("express");
const { PrismaClient } = require("@prisma/client");

const MAX_TODO_LENGTH = 2048;
const port = Number(process.env.PORT) || 3000;
const app = express();
const prisma = new PrismaClient();

const INITIAL_TODOS = [
  { text: "Buy groceries" },
  { text: "Finish Kubernetes exercises" },
  { text: "Book dentist appointment" },
];

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

const mapTodo = (todo) => ({
  id: todo.id,
  text: todo.text,
  createdAt: todo.createdAt.toISOString(),
});

const ensureSeedTodos = async () => {
  const existingTodoCount = await prisma.todo.count();

  if (existingTodoCount > 0) {
    return;
  }

  await prisma.todo.createMany({
    data: INITIAL_TODOS,
  });
};

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/todos", async (_req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(todos.map(mapTodo));
  } catch (error) {
    next(error);
  }
});

app.post("/api/todos", async (req, res, next) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Todo text is required." });
  }

  if (text.length > MAX_TODO_LENGTH) {
    return res.status(400).json({ error: `Todo text must be ${MAX_TODO_LENGTH} characters or less.` });
  }

  try {
    const todo = await prisma.todo.create({
      data: { text },
    });

    return res.status(201).json(mapTodo(todo));
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error." });
});

const start = async () => {
  await ensureSeedTodos();

  const server = app.listen(port, () => {
    console.log(`Server started in port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch(async (error) => {
  console.error("Failed to start server", error);
  await prisma.$disconnect();
  process.exit(1);
});
