import GraphCanvas from './components/GraphCanvas';
import './App.css';
import { useState } from 'react';
import { buildAdjacencyList, dijkstra } from './utils/graphUtils';



function App() {
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [edges, setEdges] = useState([]);
    const [hoveredEdgeIndex, setHoveredEdgeIndex] = useState(null);
    const [editingEdgeIndex, setEditingEdgeIndex] = useState(null);
    const [placingNodes, setPlacingNodes] = useState(true);
    const [startNodeId, setStartNodeId] = useState(null);
    const [endNodeId, setEndNodeId] = useState(null);
    const [selectingMode, setSelectingMode] = useState(null);
    const [shortestPath, setShortestPath] = useState([]);
    const [totalDistance, setTotalDistance] = useState(null);

    const resetPath = () => {
        setShortestPath([]);
        setTotalDistance(null);
    };

    function runDijkstra() {
        const adjList = buildAdjacencyList(nodes, edges);
        
        if (!startNodeId || !endNodeId) {
            alert("Please select both a start and end node.");
            return;
        }

        const { distances, previous } = dijkstra(adjList, startNodeId, endNodeId);

        let path = [];
        let current = endNodeId;
        
        if (distances[endNodeId] === Infinity) {
            setShortestPath("no path");
            setTotalDistance(null);

            return ;
        }

        while (current !== null) {
                path.unshift(current);
                current = previous[current];
            }

         if (path[0] !== startNodeId) {
            setShortestPath("no path");
            setTotalDistance(null);
            console.log("Invalid path structure.");
            return;
        }

        setShortestPath(path);
        setTotalDistance(distances[endNodeId]);

    }


    return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>


        <h1 style={{ textAlign: 'center', marginBottom: '10px'}}>Graph Algorithm Visualiser</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
            <button
                className="graph-button"
                style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
                onClick={() => {
                    setNodes([]);
                    setEdges([]);
                    setSelectedNode(null);
                    setEditingEdgeIndex(null);
                    setHoveredEdgeIndex(null);
                    setStartNodeId(null);
                    setEndNodeId(null);
                    setSelectingMode(null);
                    resetPath();
                }}
                >
                Clear Graph
            </button>
            <button
                className={`graph-button ${selectingMode === 'start' ? 'start-active' : ''}`}
                onClick={() => setSelectingMode(selectingMode === 'start' ? null : 'start')}
                >
                    Select Start Node
            </button>

            <button
                className={`graph-button ${selectingMode === 'end' ? 'end-active' : ''}`}
                onClick={() => setSelectingMode(selectingMode === 'end' ? null : 'end')}
                >
                    Select End Node
            </button>

            <button
                className="graph-button"
                onClick={runDijkstra}
                disabled={startNodeId === null || endNodeId === null}
                >
                    Run Dijkstra
            </button>

            <button 
                className="graph-button"
                onClick={() => setPlacingNodes(!placingNodes)}>
                {placingNodes ? 'Exit Node Placing Mode' : 'Enter Node Placing Mode'}
            </button>

            {totalDistance !== null && totalDistance !== Infinity && shortestPath !== "no path" && (
                <div className="total-distance" style={{ marginTop: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                    Total Distance: {totalDistance}
                </div>
            )}

            
        </div>

        <GraphCanvas
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            editingEdgeIndex={editingEdgeIndex}
            setEditingEdgeIndex={setEditingEdgeIndex}
            hoveredEdgeIndex={hoveredEdgeIndex}
            setHoveredEdgeIndex={setHoveredEdgeIndex}
            placingNodes={placingNodes}
            setPlacingNodes={setPlacingNodes}
            startNodeId={startNodeId}
            setStartNodeId={setStartNodeId}
            endNodeId={endNodeId}
            setEndNodeId={setEndNodeId}
            selectingMode={selectingMode}
            setSelectingMode={setSelectingMode}
            shortestPath={shortestPath}
            setShortestPath={setShortestPath}
            resetPath={resetPath}
        />
    </div>
    );
}

export default App;
