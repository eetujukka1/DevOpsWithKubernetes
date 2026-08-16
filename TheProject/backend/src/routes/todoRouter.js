const { Router } = require("express");

const { createTodo, listTodos, updateTodo } = require("../controllers/todoController");

const router = Router();

router.get("/", listTodos);
router.post("/", createTodo);
router.put("/:id", updateTodo);

module.exports = router;
