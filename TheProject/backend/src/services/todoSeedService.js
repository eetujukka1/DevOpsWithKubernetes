const prisma = require("../db/prisma");

const INITIAL_TODOS = [
  { text: "Buy groceries" },
  { text: "Finish Kubernetes exercises" },
  { text: "Book dentist appointment" },
];

const ensureSeedTodos = async () => {
  const existingTodoCount = await prisma.todo.count();

  if (existingTodoCount > 0) {
    return;
  }

  await prisma.todo.createMany({
    data: INITIAL_TODOS,
  });
};

module.exports = { ensureSeedTodos };
