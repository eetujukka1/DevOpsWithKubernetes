const prisma = require("../db/prisma");

const MAX_TODO_LENGTH = 140;

const mapTodo = (todo) => ({
  id: todo.id,
  text: todo.text,
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

    return res.status(201).json(mapTodo(todo));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTodo,
  listTodos,
  mapTodo,
};
