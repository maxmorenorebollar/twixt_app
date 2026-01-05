import express from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { GameState, Edge } from "./types.js";
import { initGraph } from "./graph.js";
import { nanoid } from "nanoid";
const app = express();
app.use(express.json());
const server = createServer(app);
const PORT = 3000;

const generateInitialGameState = (): GameState => {
  const newGraph = initGraph();
  const newLinks: Edge[] = [];
  const initialState = { graph: newGraph, player: undefined, links: newLinks };

  return initialState;
};

const gameManager = new Map<string, string[]>();
interface ClientToServerEvents {
  "join-game": (payload: {
    playerId: string;
    gameId: string;
    gameState: GameState;
  }) => void;
  "end-turn": (payload: { player: number; gameState: GameState }) => void;
}

interface ServerToClientEvents {
  "joined-game": (payload: { gameId: string; player: number }) => void;
  "ended-turn": (payload: { player: number; gameState: GameState }) => void;
}

const socketManager = new Map<
  string,
  Socket<ClientToServerEvents, ServerToClientEvents>
>();

const gameStateManager = new Map<string, GameState[]>();

app.get("/", (_req, res) => {
  res.send("Pong");
});

app.post("/creategame", (req, res) => {
  const newGameState = generateInitialGameState();
  const gameId = nanoid(8);
  gameStateManager.set(gameId, [newGameState]);
  res.send(gameId);
});

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("join-game", ({ playerId, gameId, gameState }) => {
    console.log(`${playerId} joining game ${gameId}`);

    const players = gameManager.get(gameId) ?? [];
    players.push(playerId);
    gameManager.set(gameId, players);

    const currGameStates = [...(gameStateManager.get(gameId) ?? [])];
    currGameStates.push(gameState);
    gameStateManager.set(gameId, currGameStates);

    // need to handle case where a client disconnects then reconnects
    socketManager.set(playerId, socket);

    socket.emit("joined-game", {
      gameId,
      player: players.length - 1,
    });
  });

  socket.on("end-turn", ({ player, gameState }) => {
    const opponentId = gameManager.get("123456")![player];
    const opponentSocket = socketManager.get(opponentId);
    opponentSocket!.emit("ended-turn", {
      player: player,
      gameState: gameState,
    });
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
