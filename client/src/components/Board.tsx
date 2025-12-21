import { useState } from "react";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { initGraph, addEdgesToGraph, findWinner } from "../game/graph.ts";
import type { GraphNode, Edge } from "../types";
import Peg from "./Peg.js";
import Link from "./Link.js";

const Board = () => {
  const [graph, setGraph] = useState(initGraph());
  const [currentPlayer, setPlayer] = useState(0);
  const [validMoves, setValidMoves] = useState<number[][]>([]);
  const [hoverNode, setHoverNode] = useState(null);
  const [links, setLinks] = useState<Edge[]>([]);
  const [winner, setWinner] = useState<number | undefined>(undefined);

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

  function nodeCenter(n: GraphNode) {
    return {
      x: n.col * spacing + spacing / 2,
      y: n.row * spacing + spacing / 2,
    };
  }

  function canCreateLink(x: number, y: number, currentPlayer: number) {
    let node = graph.find((node) => node.row == x && node.col == y);

    if (node === undefined) {
      console.log("node could not be found");
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
    let node = graph.find((node) => node.row == x && node.col == y);

    if (node === undefined) {
      console.log("node could not be found");
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
    if (graph[clickedId].player !== undefined) {
      return;
    } else if (winner !== undefined) {
      return;
    }

    graph[clickedId] = { ...graph[clickedId], player: currentPlayer };
    const node = graph[clickedId];

    // check isValid on all nodes then if it's owned by same player create a link
    const newLinks = [];
    for (const [dx, dy] of directions) {
      let nx = node.row + dx;
      let ny = node.col + dy;

      const otherNode = canCreateLink(nx, ny, currentPlayer);
      console.log("otherNode: ", otherNode);
      if (otherNode) {
        const canidate = { nodeA: node, nodeB: otherNode };
        const intersects = links.some((link) =>
          doSegmentsIntersect(canidate, link)
        );

        if (!intersects) {
          newLinks.push(canidate);
        }
      }
    }

    const newGraph = addEdgesToGraph(newLinks, graph);
    const newWinner = findWinner(newGraph);

    setGraph(newGraph);
    setPlayer(1 - currentPlayer);
    setLinks(newLinks.concat(links));
    setWinner(newWinner);
    console.log(graph);
  }

  // console.log(currentPlayer);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Chip
          label={
            currentPlayer === 0
              ? "Turn: Blue (top to bottom)"
              : "Turn: Red (left to right)"
          }
          color={currentPlayer === 0 ? "primary" : "secondary"}
          className="turn-chip"
        />
        {winner !== undefined && (
          <Chip
            label={winner === 0 ? "Blue wins" : "Red wins"}
            color={winner === 0 ? "primary" : "secondary"}
            variant="outlined"
            className="winner-chip"
          />
        )}
      </Stack>

      <Paper variant="outlined" className="board-paper">
        <Box className="board-shell">
          <Box className="board-square">
            <svg viewBox="0 0 1000 1000" className="board-svg">
              {links.map((link) => {
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
              {graph.map((n) => {
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
