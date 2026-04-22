/** @format */

const TodoModel = require("../models/todoModel");

const TodoController = {
  getTodos: (req, res) => {
    const todos = TodoModel.getAll();
    res.json(todos);
  },
  addTodo: (req, res) => {
    if (!req.body.text) return res.status(400).json({ error: "Text needed" });
    const newTodo = TodoModel.add(req.body);
    res.status(201).json(newTodo);
  },
  toggleTodo: (req, res) => {
    const updatedTodo = TodoModel.toggle(req.params.id);
    if (updatedTodo) res.json(updatedTodo);
    else res.status(404).json({ error: "Todo not found" });
  },
  deleteTodo: (req, res) => {
    TodoModel.delete(req.params.id);
    res.status(204).send();
  },
};

module.exports = TodoController;
