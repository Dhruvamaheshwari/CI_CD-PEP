/** @format */

const expres = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const ChatModel = require("./models/chatModel");

const app = expres();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(expres.json());

app.get("/api/chat", (req, res) => {
  const roomId = req.query.roomId || "default";
  res.json(ChatModel.getAll(roomId));
});

app.get("/api/rooms", (req, res) => {
  res.json(ChatModel.getAllRooms());
});

app.delete("/api/rooms/:roomId", (req, res) => {
  ChatModel.deleteRoom(req.params.roomId);
  io.emit("room_deleted", req.params.roomId);
  res.json({ success: true });
});

app.delete("/api/chat/:roomId/:messageId", (req, res) => {
  ChatModel.deleteMessage(req.params.roomId, req.params.messageId);
  io.emit("message_deleted", req.params.messageId);
  res.json({ success: true });
});

app.delete("/api/user/:username", (req, res) => {
  ChatModel.deleteUser(req.params.username);
  io.emit("user_deleted", req.params.username);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    io.emit("room_added", roomId);
  });

  socket.on("send_message", (data) => {
    const savedMsg = ChatModel.add(data);
    io.emit("receive_message", savedMsg);
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("health is OK");
});

// Serve React App (Vite build)
app.use(expres.static(path.join(__dirname, "frontend/dist")));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5000;

module.exports = server; // Exporting server for tests if needed

if (process.env.NODE_env !== "test") {
  server.listen(PORT, () => console.log("server is running on port 5000"));
}
