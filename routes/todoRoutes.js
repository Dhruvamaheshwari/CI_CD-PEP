/** @format */

const express = require("express");
const router = express.Router();
const TodoController = require("../controllers/todoController");

router.get("/", TodoController.getTodos);
router.post("/", TodoController.addTodo);
router.patch("/:id/toggle", TodoController.toggleTodo);
router.delete("/:id", TodoController.deleteTodo);

module.exports = router;
