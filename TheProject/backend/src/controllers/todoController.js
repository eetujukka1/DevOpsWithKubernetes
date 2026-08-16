const prisma = require("../db/prisma");
const logger = require("../logger");
const { publishTodoCreated } = require("../services/natsService");

const MAX_TODO_LENGTH = 140;

const mapTodo = (todo) => ({
  id: todo.id,
  text: todo.text,
  done: todo.done,
  createdAt: todo.createdAt.toISOString(),
});

const listTodos = async (_req, res, next) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(todos.map(mapTodo));
  } catch (error) {
    next(error);
  }
};

const createTodo = async (req, res, next) => {
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

    const mappedTodo = mapTodo(todo);

    publishTodoCreated(mappedTodo).catch((error) => {
      logger.warn("Failed to publish todo-created event", { error, todoId: mappedTodo.id });
    });

    return res.status(201).json(mappedTodo);
  } catch (error) {
    return next(error);
  }
};

const updateTodo = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Todo id must be a positive integer." });
  }

  if (typeof req.body?.done !== "boolean") {
    return res.status(400).json({ error: "Todo done status is required." });
  }

  try {
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: "Todo not found." });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data: { done: req.body.done },
    });

    return res.json(mapTodo(todo));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTodo,
  listTodos,
  mapTodo,
  updateTodo,
};
