const { Router } = require("express");

const { createTodo, listTodos } = require("../controllers/todoController");

const router = Router();

router.get("/", listTodos);
router.post("/", createTodo);

module.exports = router;
