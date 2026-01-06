export function initNode(id, row, col) {
    return { id, row, col, neighbors: [], player: undefined };
}
export function initGraph() {
    const nodes = [];
    for (let r = 0; r < 24; r++) {
        for (let c = 0; c < 24; c++) {
            const id = r * 24 + c;
            nodes.push(initNode(id, r, c));
        }
    }
    nodes.push(Object.assign(Object.assign({}, initNode(576, -1, -1)), { player: 0 })); // top node connect to player 0
    nodes.push(Object.assign(Object.assign({}, initNode(577, -1, -1)), { player: 0 })); // bot node connect to player 0
    nodes.push(Object.assign(Object.assign({}, initNode(578, -1, -1)), { player: 1 })); // left node connect to player 1
    nodes.push(Object.assign(Object.assign({}, initNode(579, -1, -1)), { player: 1 })); // right node connect to player 1
    // connect top row to top node
    for (let i = 0; i < 24; i++) {
        nodes[i].neighbors.push(576);
        nodes[576].neighbors.push(i);
    }
    // connect bottom row to bottom node
    for (let i = 0; i < 24; i++) {
        nodes[23 * 24 + i].neighbors.push(577);
        nodes[577].neighbors.push(23 * 24 + 1);
    }
    // connect left most column to left node
    for (let i = 0; i < 24; i++) {
        nodes[i * 24].neighbors.push(578);
        nodes[578].neighbors.push(i * 24);
    }
    // connect right most column to right node
    for (let i = 0; i < 24; i++) {
        nodes[(i + 1) * 24 - 1].neighbors.push(579);
        nodes[579].neighbors.push((i + 1) * 24 - 1);
    }
    return nodes;
}
export function addEdgeToGraph(graph, nodeA, nodeB) {
    const newGraph = graph.map((node) => {
        if (node.id === nodeA.id) {
            return Object.assign(Object.assign({}, node), { neighbors: [...node.neighbors, nodeB.id] });
        }
        else if (node.id === nodeB.id) {
            return Object.assign(Object.assign({}, node), { neighbors: [...node.neighbors, nodeA.id] });
        }
        return node;
    });
    return newGraph;
}
// Returns deep copy
export function addEdgesToGraph(edges, graph) {
    const newGraph = graph.map((node) => (Object.assign(Object.assign({}, node), { neighbors: [...node.neighbors] })));
    for (const edge of edges) {
        const nodeA = edge.nodeA;
        const nodeB = edge.nodeB;
        newGraph[nodeA.id].neighbors.push(nodeB.id);
        newGraph[nodeB.id].neighbors.push(nodeA.id);
    }
    return newGraph;
}
export function findWinner(graph) {
    const visited = new Set();
    // Check if player 0 (top/bottom) has won
    const dfsPlayer0 = (current) => {
        if (current === 577) {
            // Reached bottom node
            return true;
        }
        visited.add(current);
        for (const neighborId of graph[current].neighbors) {
            // For player 0, we can only traverse nodes owned by player 0
            // or the border nodes (which have player: undefined)
            if (!visited.has(neighborId) && graph[neighborId].player === 0) {
                if (dfsPlayer0(neighborId)) {
                    return true;
                }
            }
        }
        return false;
    };
    // Check if player 1 (left/right) has won
    const dfsPlayer1 = (current) => {
        if (current === 579) {
            // Reached right node
            return true;
        }
        visited.add(current);
        for (const neighborId of graph[current].neighbors) {
            // For player 1, we can only traverse nodes owned by player 1
            // or the border nodes (which have player: undefined)
            if (!visited.has(neighborId) &&
                (graph[neighborId].player === 1 ||
                    graph[neighborId].player === undefined)) {
                if (dfsPlayer1(neighborId)) {
                    return true;
                }
            }
        }
        return false;
    };
    // Check player 0 (top to bottom)
    visited.clear();
    if (dfsPlayer0(576))
        return 0;
    // Check player 1 (left to right)
    visited.clear();
    if (dfsPlayer1(578))
        return 1;
    console.log("No winner");
    return undefined;
}
