require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const PORT = process.env.PORT || 3000;
const connectDB = require("./lib/db");
const { Server } = require("socket.io");

// create express app and http server
const app = express();
const server = http.createServer(app);
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

//initialiaze socket.io server
const io = new Server(server, {
  cors: { origin: "*" }, //Accept socket connections from: Any domain, Any port, Any protocol
});

// store online users
const userSocketMap = {}; // { userId: socketId }

//socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) {
    userSocketMap[userId] = socket.id; // “This user is online, and this is their socket.”
  }
  // Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId]; // Remove user from online list
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Re-broadcast updated online users
  });
});

// middleware setup
app.use(express.json({ limit: "4mb" })); // to upload images of maximum 4mb limit
app.use(cors());

//routes setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

// connect to the database
connectDB();

server.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));

module.exports = { io, userSocketMap };
