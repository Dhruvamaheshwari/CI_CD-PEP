/** @format */

const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "../data.json");

// Initialize local storage file if not exists
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

const TodoModel = {
  getAll: () => {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data);
  },
  saveAll: (todos) => {
    fs.writeFileSync(dataFile, JSON.stringify(todos, null, 2));
  },
  add: (todo) => {
    const todos = TodoModel.getAll();
    const newTodo = {
      id: Date.now().toString(),
      text: todo.text,
      completed: false,
    };
    todos.push(newTodo);
    TodoModel.saveAll(todos);
    return newTodo;
  },
  toggle: (id) => {
    const todos = TodoModel.getAll();
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    TodoModel.saveAll(updated);
    return updated.find((t) => t.id === id);
  },
  delete: (id) => {
    const todos = TodoModel.getAll();
    const filtered = todos.filter((t) => t.id !== id);
    TodoModel.saveAll(filtered);
  },
};

module.exports = TodoModel;
