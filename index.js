/** @format */

const expres = require("express");
const path = require("path");
const cors = require("cors");
const todoRoutes = require("./routes/todoRoutes");
const app = expres();

app.use(cors());
app.use(expres.json());

app.get("/health", (req, res) => {
  res.status(200).send("health is OK");
});

app.use("/api/todos", todoRoutes);

// Serve React App (Vite build)
app.use(expres.static(path.join(__dirname, "frontend/dist")));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

const PORT = 5000;

module.exports = app;

if (process.env.NODE_env !== "test") {
  app.listen(PORT, () => console.log("server is running on port 5000"));
}
