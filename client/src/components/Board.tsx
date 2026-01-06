import { useState, useEffect, useReducer } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { initGraph, addEdgesToGraph, findWinner } from "../game/graph.ts";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router";
import io, { Socket } from "socket.io-client";
import type { Graph, GraphNode, Edge } from "../types";
import Peg from "./Peg.js";
import Link from "./Link.js";

const socket: Socket = io("http://localhost:3000");
const playerId: string = uuidv4();
interface GameState {
  graph: Graph;
  player: number | undefined;
  links: Edge[];
  winner?: number;
}

type Action = { type: "turn" | "end-turn" | "initial-game" } & GameState;

const reducer = (prevState: GameState, action: Action) => {
  if (action.type === "end-turn") {
    // represents client ending their turn
    console.log("end turn", action);
  }
  return {
    ...prevState,
    graph: action.graph,
    player: action.player,
    links: action.links,
    winner: action.winner,
  };
};

const generateInitialGameState = () => {
  const newGraph = initGraph();
  const newLinks: Edge[] = [];
  const initialState = { graph: newGraph, player: undefined, links: newLinks };

  return initialState;
};

const Board = () => {
  const [validMoves, setValidMoves] = useState<number[][]>([]);
  const [localPlayer, setLocalPlayer] = useState<string | undefined>(undefined);
  const [gameState, dispatch] = useReducer(reducer, generateInitialGameState());
  const { gameId } = useParams();

  const spacing = 1000 / 24;
  const directions = [
    [-2, 1],
    [-1, 2],
    [1, 2],
    [2, 1],
    [-2, -1],
    [-1, -2],
    [1, -2],
    [2, -1],
  ];

  useEffect(() => {
    socket.emit("join-game", { playerId: playerId, gameId: gameId });

    socket.on("joined-game", (msg) => {
      dispatch({
        type: "initial-game",
        ...msg.gameState,
      });
      setLocalPlayer(msg.player);
      console.log(`starting game as player: ${msg.player}`);
    });

    socket.on("ended-turn", (msg) => {
      console.log(msg);
      dispatch({ type: "turn", ...msg.gameState });
    });
  }, []);

  function nodeCenter(n: GraphNode) {
    return {
      x: n.col * spacing + spacing / 2,
      y: n.row * spacing + spacing / 2,
    };
  }

  function canCreateLink(x: number, y: number, currentPlayer: number) {
    let node = gameState.graph.find((node) => node.row == x && node.col == y);

    if (node === undefined) {
      // console.log("node could not be found");
      return undefined;
    } else if (node.player === undefined) {
      return undefined;
    } else if (node.player !== currentPlayer) {
      return undefined;
    }

    return node;
  }

  function doSegmentsIntersect(a: Edge, b: Edge) {
    // Calculate orientation of triplet (p, q, r)

    const sharesEndpoint =
      a.nodeA.id === b.nodeA.id ||
      a.nodeA.id === b.nodeB.id ||
      a.nodeB.id === b.nodeA.id ||
      a.nodeB.id === b.nodeB.id;
    if (sharesEndpoint) return false;

    const getOrientation = (
      p: GraphNode,
      q: GraphNode,
      r: GraphNode
    ): number => {
      const val =
        (q.col - p.col) * (r.row - q.row) - (q.row - p.row) * (r.col - q.col);
      if (val === 0) return 0; // Collinear
      return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
    };

    // Check if point r lies on segment pq
    const isOnSegment = (p: GraphNode, q: GraphNode, r: GraphNode): boolean => {
      return (
        r.row <= Math.max(p.row, q.row) &&
        r.row >= Math.min(p.row, q.row) &&
        r.col <= Math.max(p.col, q.col) &&
        r.col >= Math.min(p.col, q.col)
      );
    };

    const o1 = getOrientation(a.nodeA, a.nodeB, b.nodeA);
    const o2 = getOrientation(a.nodeA, a.nodeB, b.nodeB);
    const o3 = getOrientation(b.nodeA, b.nodeB, a.nodeA);
    const o4 = getOrientation(b.nodeA, b.nodeB, a.nodeB);

    // General case: segments straddle each other
    if (o1 !== o2 && o3 !== o4) return true;

    // Special cases (collinear points)
    if (o1 === 0 && isOnSegment(a.nodeA, a.nodeB, b.nodeA)) return true;
    if (o2 === 0 && isOnSegment(a.nodeA, a.nodeB, b.nodeB)) return true;
    if (o3 === 0 && isOnSegment(b.nodeA, b.nodeB, a.nodeA)) return true;
    if (o4 === 0 && isOnSegment(b.nodeA, b.nodeB, a.nodeB)) return true;

    return false;
  }

  function isValidMove(x: number, y: number) {
    let node = gameState.graph.find((node) => node.row == x && node.col == y);

    if (node === undefined) {
      return false;
    } else if (node.player !== undefined) {
      return false;
    }

    return true;
  }

  function handleMouseEnter(node: GraphNode) {
    let valid = [];
    for (const [dx, dy] of directions) {
      let nx = node.row + dx;
      let ny = node.col + dy;
      if (isValidMove(nx, ny)) {
        valid.push([nx, ny]);
      }
    }

    setValidMoves(valid);
  }

  function handleMouseLeave() {
    setValidMoves([]);
  }

  function handlePegClick(clickedId: number) {
    if (gameState.graph[clickedId].player !== undefined) {
      return;
    } else if (gameState.winner !== undefined) {
      return;
    } else if (
      gameState.player !== localPlayer ||
      gameState.player === undefined
    ) {
      return;
    }

    const node = gameState.graph[clickedId];
    node.player = gameState.player;

    // check isValid on all nodes then if it's owned by same player create a link
    const newLinks = [];
    for (const [dx, dy] of directions) {
      let nx = node.row + dx;
      let ny = node.col + dy;

      const otherNode = canCreateLink(nx, ny, gameState.player!);
      if (otherNode) {
        const canidate = { nodeA: node, nodeB: otherNode };
        const intersects = gameState.links.some((link) =>
          doSegmentsIntersect(canidate, link)
        );

        if (!intersects) {
          newLinks.push(canidate);
        }
      }
    }

    const newGraph = addEdgesToGraph(newLinks, gameState.graph);
    const newWinner = findWinner(newGraph);
    const newGameState = {
      graph: newGraph,
      player: gameState.player,
      links: newLinks.concat(gameState.links),
      winner: newWinner,
    };
    socket.emit("end-turn", {
      gameId: gameId,
      playerId: playerId,
      gameState: newGameState,
    });
    dispatch({
      type: "end-turn",
      graph: newGraph,
      player: 1 - gameState.player!,
      links: newLinks.concat(gameState.links),
      winner: newWinner,
    });
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip
          label={
            gameState.player === 0
              ? "Turn: Blue (top to bottom)"
              : "Turn: Red (left to right)"
          }
          color={gameState.player === 0 ? "primary" : "secondary"}
          className="turn-chip"
        />
        {gameState.winner !== undefined && (
          <Chip
            label={gameState.winner === 0 ? "Blue wins" : "Red wins"}
            color={gameState.winner === 0 ? "primary" : "secondary"}
            variant="outlined"
            className="winner-chip"
          />
        )}
      </Stack>

      <Paper variant="outlined" className="board-paper">
        <Box className="board-shell">
          <Box className="board-square">
            <svg viewBox="0 0 1000 1000" className="board-svg">
              {gameState.links.map((link) => {
                const p1 = nodeCenter(link.nodeA);
                const p2 = nodeCenter(link.nodeB);
                return (
                  <Link
                    key={`${link.nodeA.id}-${link.nodeB.id}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    color={link.nodeA.player === 0 ? "#60a5fa" : "#f87171"}
                  />
                );
              })}
              {gameState.graph.map((n) => {
                return (
                  <Peg
                    key={n.id}
                    cx={n.col * spacing + spacing / 2}
                    cy={n.row * spacing + spacing / 2}
                    player={n.player}
                    validMove={validMoves.some(
                      (node) => n.row == node[0] && n.col == node[1]
                    )}
                    onClick={() => handlePegClick(n.id)}
                    handleMouseEnter={() => handleMouseEnter(n)}
                    handleMouseLeave={() => handleMouseLeave()}
                  />
                );
              })}
            </svg>
          </Box>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Links cannot cross. Valid moves glow yellow. Race to connect your sides
        first.
      </Typography>
    </Stack>
  );
};

export default Board;
