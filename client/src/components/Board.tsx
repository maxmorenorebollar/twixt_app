import { useState } from "react";
import * as Graph from "../game/graph.js";
import Peg from "./Peg.js";
import Link from "./Link.js";

const Board = () => {
  const [graph, setGraph] = useState(Graph.initGraph());
  const spacing = 1000 / 24;
  const [currentPlayer, setPlayer] = useState(0);
  const [validMoves, setValidMoves] = useState([]);
  const [hoverNode, setHoverNode] = useState(null);

  const directions = [
    [-2, 1],
    [-1, 2],
    [1, 2],
    [2, 1],
  ];

  function handlePegClick(clickedId: number) {
    setGraph((prevGraph) =>
      prevGraph.map((node) =>
        node.id === clickedId ? { ...node, player: currentPlayer } : node
      )
    );

    setPlayer((prevPlayer) => 1 - prevPlayer);

    //console.log(player)
  }

  function isValidMove(x, y) {
    console.log(x, y);
    let node = graph.find((node) => node.row == x && node.col == y);

    if (node == undefined) {
      console.log("node could not be found");
      return false;
    }

    if (node.player != null) {
      return false;
    }

    return true;
  }

  function handleMouseEnter(node: Node) {
    let valid = [];
    for (const [dx, dy] of directions) {
      let nx = node.row + dx;
      let ny = node.col + dy;
      if (isValidMove(nx, ny)) {
        valid.push([nx, ny]);
      }
    }

    setValidMoves(valid);
    // console.log(valid)
  }

  function handleMouseLeave() {
    setValidMoves([]);
  }

  console.log(currentPlayer);

  return (
    <>
      <p>Player {currentPlayer}</p>
      <svg height="1000" width="1000">
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
    </>
  );
};

export default Board;
