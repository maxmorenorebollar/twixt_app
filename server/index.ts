import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";

const app = express();
app.use(express.json());
const server = createServer(app);
const PORT = 3000;

const gameManager = new Map<string, Socket[]>();
const gameSteps: any = [];
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

io.on("connection", (socket: Socket) => {
  socket.on("join-game", (gameId) => {
    console.log(`${socket.id} joing game ${gameId}`);

    const players = gameManager.get(gameId) ?? [];
    players.push(socket);
    gameManager.set(gameId, players);

    socket.emit("joined-game", {
      gameId,
      player: players.length - 1,
    });
  });

  socket.on("end-turn", (msg) => {
    gameSteps.push(msg);
    const client = gameManager.get("1234")![msg.player];
    client.emit("turn", msg);
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
