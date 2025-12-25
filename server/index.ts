import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";

const app = express();
app.use(express.json());
const server = createServer(app);
const PORT = 3000;

const gameManager = new Map<string, string[]>();
const socketManager = new Map<string, Socket>();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (_req, res) => {
  res.send("Pong");
});

io.on("connection", (socket: Socket) => {
  socket.on("join-game", ({ playerId, gameId }) => {
    console.log(`${playerId} joing game ${gameId}`);

    const players = gameManager.get(gameId) ?? [];
    players.push(playerId);
    gameManager.set(gameId, players);

    socketManager.set(playerId, socket);

    socket.emit("joined-game", {
      gameId,
      player: players.length - 1,
    });
  });

  socket.on("end-turn", (msg) => {
    const opponentId = gameManager.get("123456")![msg.player];
    const opponentSocket = socketManager.get(opponentId);
    opponentSocket!.emit("turn", msg);
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
