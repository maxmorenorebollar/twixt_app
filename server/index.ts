import express, { Request, Response } from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { GameState, Edge } from "./types.js";
import { initGraph } from "./graph.js";
import { nanoid } from "nanoid";
import * as z from "zod";
import { Result, ok, err } from "neverthrow";
import cors from "cors";

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
const PORT = process.env.PORT ?? 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateInitialGameState = (): GameState => {
  const newGraph = initGraph();
  const newLinks: Edge[] = [];
  const initialState = { graph: newGraph, player: 0, links: newLinks };

  return initialState;
};

interface ClientToServerEvents {
  "join-game": (payload: { playerId: string; gameId: string }) => void;
  "end-turn": (payload: {
    gameId: string;
    playerId: string;
    gameState: GameState;
  }) => void;
}

interface ServerToClientEvents {
  "joined-game": (payload: {
    gameId: string;
    gameState: GameState;
    player: number;
  }) => void;
  "ended-turn": (payload: { gameState: GameState }) => void;
}

const joinGameSchema = z.object({
  playerId: z.string(),
  gameId: z.string(),
});

const endTurnSchema = z.object({
  gameId: z.string(),
  playerId: z.string(),
  gameState: z.custom<GameState>(),
});

/**
const joinedGameSchema = z.object({
  gameId: z.string(),
  gameState: z.custom<GameState>(),
  player: z.number(),
});

const _endedTurnSchema = z.object({
  gameState: z.custom<GameState>(),
});
*/

const socketManager = new Map<
  string,
  Socket<ClientToServerEvents, ServerToClientEvents>
>();

const gameStateManager = new Map<string, GameState[]>();

const gameManager = new Map<string, string[]>();

app.get("/", (_req: Request, res: Response) => {
  res.send("Pong");
});

app.post("/creategame", (_req: Request, res: Response) => {
  const newGameState = generateInitialGameState();
  const gameId = nanoid(8);
  gameStateManager.set(gameId, [newGameState]);
  res.send(JSON.stringify(gameId));
});

const validateSocketPayload = <T>(
  schema: z.ZodSchema<T>,
  payload: unknown
): Result<T, Error> => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return err(Error(`Invalid payload: ${result.error.message}`));
  }

  return ok(result.data);
};

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

io.on("connection", (socket) => {
  socket.on("join-game", (payload) => {
    const payloadResult = validateSocketPayload(joinGameSchema, payload);

    if (payloadResult.isErr()) {
      console.log(`Invalid join-game payload: ${payloadResult.error.message}`);
      return;
    }

    const { gameId, playerId } = payloadResult.value;

    const players = [...(gameManager.get(gameId) ?? [])];
    if (players.length == 2) {
      console.log("No more players for this game");
      return;
    }

    players.push(playerId);
    gameManager.set(gameId, players);

    const games = gameStateManager.get(gameId);
    if (!games) {
      console.log(`Invalid join-game payload: ${gameId} could not be found.`);
      return;
    }

    const game = games[games.length - 1];
    if (!game) {
      console.log(
        "Invalid join-game action. Game was not initilized correctly."
      );
    }

    // need to handle case where a client disconnects then reconnects
    socketManager.set(playerId, socket);
    socket.emit("joined-game", {
      gameId,
      gameState: game,
      player: players.length - 1,
    });
  });

  socket.on("end-turn", (payload) => {
    const payloadResult = validateSocketPayload(endTurnSchema, payload);

    if (payloadResult.isErr()) {
      console.log(`Invalid end-turn payload: ${payloadResult.error.message}`);
      return;
    }

    const { gameId, playerId, gameState } = payloadResult.value;

    const playerIds = gameManager.get(gameId);
    if (!playerIds) {
      throw new Error("end-turn: could not find playerIds");
    }

    const opponentId = playerIds.find((id) => id !== playerId);
    if (!opponentId) {
      throw new Error("Could not find opponent id");
    }

    const opponentSocket = socketManager.get(opponentId);
    if (!opponentSocket) {
      throw new Error("Could not find opponent socket");
    }

    const newGameState = { ...gameState };
    if (newGameState.player === undefined) {
      throw new Error(
        "end-turn: player can't make move game with undefined player"
      );
    }
    newGameState.player = 1 - newGameState.player;

    opponentSocket.emit("ended-turn", {
      gameState: newGameState,
    });
  });
});

const clientDist = join(__dirname, "../../client/dist");
app.use(express.static(clientDist, { maxAge: "1y", etag: false }));
app.get(/^(.*)$/, (_req, res) => res.sendFile(join(clientDist, "index.html")));

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
