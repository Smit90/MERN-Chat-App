const express = require("express");
const connectDB = require("./config/db");
var colors = require("colors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require('cors')

// dotenv.config();
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

//database connection
connectDB();
const app = express();

app.use(express.json()); // to accept json data
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to chat app");
});

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONT_END_URL,
    // credentials: true,
  },
});

var onlineUsers = [];

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    const isExist = onlineUsers.some((x) => x == userData._id);
    if (!isExist) {
      onlineUsers.push(userData._id);
    }
    console.log("test");
    socket.emit("connected", onlineUsers);
    socket.broadcast.emit("connected", onlineUsers);
  });

  socket.on("logout", (userData) => {
    socket.leave(userData._id);
    onlineUsers = onlineUsers.filter((x) => x != userData._id);
    socket.broadcast.emit("connected", onlineUsers);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
    onlineUsers = onlineUsers.filter((x) => x != userData._id);
    socket.broadcast.emit("connected", onlineUsers);
  });

  // calling feature
  socket.emit("me", socket.id);

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal)
  });

});
