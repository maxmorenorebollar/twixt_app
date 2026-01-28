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

import pino from "pino";
const logger = pino();

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
  const initialState = { graph: newGraph, player: -1, links: newLinks };

  return initialState;
};

const findOpponentId = (
  gameId: string,
  playerId: string,
  gameManager: Map<string, string[]>,
): Result<string, string> => {
  if (!gameManager.has(gameId)) {
    return err(`${gameId} could not be found in gameManager`);
  }

  const players = gameManager.get(gameId);
  const opponentId = players?.find((id) => id !== playerId);

  if (!opponentId) {
    return err(`${gameId}: opponent does not exist in game`);
  }

  return ok(opponentId);
};

const joinGame = (
  gameId: string,
  playerId: string,
  gameManager: Map<string, string[]>,
) => {
  if (!gameManager.has(gameId)) {
    return err(
      new Error(
        `Player: ${playerId} Game: ${gameId} Message: join-game failed. Game could not be found in gameManager`,
      ),
    );
  }

  const players = gameManager.get(gameId);

  if (!players) {
    return err(
      new Error(
        `Player: ${playerId} Game: ${gameId} Message: join-game failed. Players Array not initilized correctly.`,
      ),
    );
  }

  if (players.length >= 2) {
    return err(
      new Error(
        `Player: ${playerId} Game: ${gameId} Message: join-game failed. Game is full`,
      ),
    );
  }

  players.push(playerId);
  gameManager.set(gameId, players);

  return ok({ playerId: playerId, gameId: gameId });
};

const getLatestGameState = (gameId: string): Result<GameState, Error> => {
  let gameState = gameStateManager.get(gameId);

  if (gameState === undefined) {
    return err(new Error("GameState array not initialized correctly."));
  }

  if (gameState.length === 0) {
    return err(new Error("GameState array length is 0."));
  }

  return ok(gameState[gameState.length - 1]);
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
  gameManager.set(gameId, []);
  res.send(JSON.stringify(gameId));
});

const validateSocketPayload = <T>(
  schema: z.ZodSchema<T>,
  payload: unknown,
): Result<T, Error> => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return err(Error(`Invalid payload: ${result.error.message}`));
  }

  return ok(result.data);
};

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

io.on("connection", (socket) => {
  logger.info(`Client connected. ID=${socket.id}`);

  socket.on("join-game", (payload) => {
    logger.info(
      `Client: ${socket.id} Message: join-game Payload: ${JSON.stringify(payload)}`,
    );
    const payloadResult = validateSocketPayload(joinGameSchema, payload);

    payloadResult
      .andThen((payload) => {
        socketManager.set(payload.playerId, socket);
        return joinGame(payload.gameId, payload.playerId, gameManager);
      })
      .andThen(({ gameId }) => {
        return getLatestGameState(gameId).map((gameState) => ({
          gameId,
          gameState,
        }));
      })
      .match(
        ({ gameId, gameState }) => {
          gameState.player += 1;
         socket.emit("joined-game", {
            gameId,
            gameState: gameState,
            player: gameState.player,
          });
        },
        (err) => {
          if (err instanceof Error) {
            logger.error(err.message);
          }
        },
      );
  });

  socket.on("end-turn", (payload) => {
    ok(payload)
      .andThen((payload) => validateSocketPayload(endTurnSchema, payload))
      .andThen(({ gameId, playerId, gameState }) => {
        return findOpponentId(gameId, playerId, gameManager)
          .andThen((oppId) => {
            const oppSocket = socketManager.get(oppId);
            if (oppSocket) {
              return ok(oppSocket);
            }

            return err(`${gameId}: can't find opponent`);
          })
          .map((oppSocket) => ({ oppSocket, gameState }));
      })
      .match(
        ({ oppSocket, gameState }) => {
          const gameStates = gameStateManager.get(payload.gameId);
          if (gameStates) {
            gameStates.push(gameState);
          }

          oppSocket.emit("ended-turn", {
            gameState: { ...gameState, player: 1 - gameState.player! },
          });
        },
        (_err) => console.log("Could not end turn"),
      );
  });
});

const clientDist = join(__dirname, "../../client/dist");
app.use(express.static(clientDist, { maxAge: "1y", etag: false }));
app.get(/^(.*)$/, (_req, res) => res.sendFile(join(clientDist, "index.html")));

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
