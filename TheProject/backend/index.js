const express = require("express");

const port = Number(process.env.PORT) || 3000;
const app = express();

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

let nextTodoId = 4;
const todos = [
  { id: 1, text: "Buy groceries", createdAt: new Date().toISOString() },
  { id: 2, text: "Finish Kubernetes exercises", createdAt: new Date().toISOString() },
  { id: 3, text: "Book dentist appointment", createdAt: new Date().toISOString() },
];

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/todos", (_req, res) => {
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Todo text is required." });
  }

  if (text.length > 140) {
    return res.status(400).json({ error: "Todo text must be 140 characters or less." });
  }

  const todo = {
    id: nextTodoId,
    text,
    createdAt: new Date().toISOString(),
  };

  nextTodoId += 1;
  todos.push(todo);

  return res.status(201).json(todo);
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
