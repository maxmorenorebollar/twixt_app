import { useState } from 'react'
import * as Graph from '../game/graph.js'
import Peg from './Peg.jsx'

const Board = () => {

    const [graph, setGraph] = useState(Graph.initGraph())
    const spacing = 1000 / 24
    const [currentPlayer, setPlayer] = useState(0)

    function handlePegClick(clickedId) {
        setGraph(prevGraph => prevGraph.map(node =>
            node.id === clickedId ? { ...node, player: currentPlayer } : node
        ))

        setPlayer(prevPlayer => 1 - prevPlayer)

        //console.log(player)
    }

    console.log(currentPlayer)

    return(
        <>
            <p>Welcome!</p>
            <svg height="1000" width="1000">
                {graph.map((n) => {
                    return <Peg key={n.id} cx={(n.col * spacing) + (spacing / 2)} cy = {(n.row * spacing) + (spacing / 2)} player={n.player} onClick={() => handlePegClick(n.id)}/>
                })}
                
            </svg>
        </>
    )
}

export default Board