/** @format */

const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "../chat.json");

// Initialize local storage file if not exists
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify({})); // Use object to store rooms
}

const ChatModel = {
  getAllRooms: () => {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch {
      data = {};
    }
    if (Array.isArray(data)) return ["default"];
    return Object.keys(data);
  },
  getAll: (roomId = "default") => {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch {
      data = {};
    }
    if (Array.isArray(data)) {
      return data;
    }
    return data[roomId] || [];
  },
  saveAll: (chats, roomId = "default") => {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch {
      data = {};
    }
    if (Array.isArray(data)) {
      data = { default: data };
    }
    data[roomId] = chats;
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  },
  add: (message) => {
    const roomId = message.roomId || "default";
    const chats = ChatModel.getAll(roomId);
    const newMessage = {
      id: Date.now().toString(),
      roomId: roomId,
      text: message.text,
      user: message.user || "Anonymous",
      avatar: message.avatar || null,
      time:
        message.time ||
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      timestamp: new Date().toISOString(),
    };
    chats.push(newMessage);
    ChatModel.saveAll(chats, roomId);
    return newMessage;
  },
  clear: (roomId = "default") => {
    ChatModel.saveAll([], roomId);
  },
  deleteRoom: (roomId) => {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch {
      data = {};
    }
    if (!Array.isArray(data) && data[roomId]) {
      delete data[roomId];
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    }
  },
  deleteMessage: (roomId, messageId) => {
    const chats = ChatModel.getAll(roomId);
    const filtered = chats.filter((msg) => msg.id !== messageId);
    ChatModel.saveAll(filtered, roomId);
  },
  deleteUser: (username) => {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
    } catch {
      data = {};
    }
    if (!Array.isArray(data)) {
      for (const room in data) {
        data[room] = data[room].filter((msg) => msg.user !== username);
      }
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    }
  },
};

module.exports = ChatModel;
