import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
const server = createServer(app);

const PORT = 3000;
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app URL
    methods: ["GET", "POST"],
    credentials: true, // If using cookies/auth
  },
});
app.get("/", (_req, res) => {
  res.send("Pong");
});

io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("new-message", "Ping");
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
