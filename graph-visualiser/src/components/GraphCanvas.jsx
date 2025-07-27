import { useState } from 'react';


function GraphCanvas({
  nodes, setNodes, edges, setEdges,
  selectedNode, setSelectedNode,
  editingEdgeIndex, setEditingEdgeIndex,
  hoveredEdgeIndex, setHoveredEdgeIndex,
  placingNodes, setPlacingNodes,
  startNodeId, setStartNodeId,
  endNodeId, setEndNodeId,
  selectingMode, setSelectingMode,
  shortestPath, setShortestPath,
  resetPath,
})
{
  function handleClick(event){
    if (!placingNodes) return;
    const canvasRect = event.currentTarget.getBoundingClientRect();
    let x = event.clientX - canvasRect.left;
    let y = event.clientY - canvasRect.top;
    const buffer = 20;
    x = Math.max(buffer, Math.min(x, canvasRect.width - buffer));
    y = Math.max(buffer, Math.min(y, canvasRect.height - buffer));
    const newNode = {
      id: nodes.length+1, x, y
    };
    setNodes([...nodes, newNode]);
    resetPath();
  }
  function handleNodeClick(nodeId) {
    if (selectingMode === 'start') {
      if (nodeId === startNodeId) {
        setStartNodeId(null);
      } else {
        setStartNodeId(nodeId);
        resetPath();
        setSelectingMode(null);
        return;
      }
    } else if (selectingMode === "end") {
        if (nodeId === endNodeId) {
          setEndNodeId(null);
        } else {
          setEndNodeId(nodeId);
          resetPath();
          setSelectingMode(null);
          return;
        }
      }
    if (selectedNode === nodeId){
      setSelectedNode(null);
    } else if (selectedNode === null) {
      setSelectedNode(nodeId);
    } else {
      const edgeExists = edges.some(edge =>
        (edge.from === selectedNode && edge.to === nodeId) ||
        (edge.from === nodeId && edge.to === selectedNode)
      );

      if (!edgeExists) {
        const newEdge = {
          from: selectedNode,
          to: nodeId,
          direction: "both",
          weight: 1,
      };
      setEdges([...edges, newEdge]);
      resetPath();
      }
      setSelectedNode(null);
    }
  }
  function cycleEdgeDirection(edgeIndex) {
    setEdges((prevEdges) => {
      const newEdges = [...prevEdges];
      const edge = {...newEdges[edgeIndex]};

      const order = { forward: 'backward', backward: 'both', both: 'forward' };
      edge.direction = order[edge.direction];

      newEdges[edgeIndex] = edge;
      return newEdges;
    });
  }
  return (
    <div 
      onClick={handleClick} 
      style={{
          position: 'relative',     
          flex: 1,
          width: '100%',
          backgroundColor: '#f0f0f0',
          overflow: 'hidden',
        }}
    >
      <svg
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      zIndex: 0,
    }}
  >
    <defs>
    <marker
      id="arrow"
      viewBox="0 0 10 10"
      refX="10"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
    </marker>
  </defs>
    {edges.map((edge, index) => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return null;

      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offset = 20; // Radius of the node (you can tweak this)

      const startX = fromNode.x + (dx / length) * offset;
      const startY = fromNode.y + (dy / length) * offset;
      const endX = toNode.x - (dx / length) * offset;
      const endY = toNode.y - (dy / length) * offset;

      let isPathEdge = false;

if (Array.isArray(shortestPath)) {
  for (let i = 0; i < shortestPath.length - 1; i++) {
    const from = shortestPath[i];
    const to = shortestPath[i + 1];

    if (
      (edge.from === from && edge.to === to) ||
      (edge.direction === 'both' && edge.from === to && edge.to === from)
    ) {
      isPathEdge = true;
      break;
    }
  }
}
      let markerStart = null;
      let markerEnd = null;

      if (edge.direction === 'forward') {
        markerEnd = 'url(#arrow)';
      } else if (edge.direction === 'backward') {
        markerStart = 'url(#arrow)';
      } else if (edge.direction === 'both') {
        markerStart = 'url(#arrow)';
        markerEnd = 'url(#arrow)';
      }

      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;

      // perpendicular offset vector (to move label slightly off the line)
      const angle = Math.atan2(dy, dx);
      const labelOffset = 10;
      const offsetX = -labelOffset * Math.sin(angle); // perpendicular direction
      const offsetY = labelOffset * Math.cos(angle);

      return (
        <g>
  {/* visible line */}
  <line
    x1={startX}
    y1={startY}
    x2={endX}
    y2={endY}
    className={`edge-line ${isPathEdge ? 'path-edge' : ''}`}
    stroke={hoveredEdgeIndex === index ? 'blue' : 'black'}
    strokeWidth="2"
    markerStart={markerStart}
    markerEnd={markerEnd}
  />
  {/* thick transparent click area */}
  <line
    onMouseEnter={() => setHoveredEdgeIndex(index)}
    onMouseLeave={() => setHoveredEdgeIndex(null)}
    x1={startX}
    y1={startY}
    x2={endX}
    y2={endY}
    stroke="transparent"
    strokeWidth="16"
    onClick={(e) => {
      e.stopPropagation();
      cycleEdgeDirection(index);
    }}
    style={{ cursor: 'pointer' }}
  />
  {editingEdgeIndex === index ? (
  <foreignObject
    x={(startX + endX) / 2 - 15}
    y={(startY + endY) / 2 - 15}
    width="50"
    height="50"
  >
    <input
      type="number"
      min="1"
      defaultValue={edge.weight}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const newWeight = parseInt(e.target.value, 10);
          if (!isNaN(newWeight)) {
            const newEdges = [...edges];
            newEdges[index].weight = newWeight;
            setEdges(newEdges);
          }
          setEditingEdgeIndex(null);
        }
      }}
      style={{
        width: '100%',
        height: '100%',
        fontSize: '14px',
        border: '1px solid gray',
        borderRadius: '4px',
        padding: '4px',
        textAlign: 'center',
      }}
    />
  </foreignObject>
) : (
  <text
    x={(startX + endX) / 2 + offsetX}
    y={(startY + endY) / 2 + offsetY}
    textAnchor="middle"
    fontSize="14"
    fill="black"
    onClick={(e) => {
      e.stopPropagation();
      setEditingEdgeIndex(index);
    }}
    style={{ cursor: 'pointer' }}
  >
    {edge.weight}
  </text>
)}
</g>
      );
    })}
  </svg>
      {nodes.map((node) => (
        <div
          className={`node
            ${node.id === startNodeId ? 'start-node' : ''}
            ${node.id === endNodeId ? 'end-node' : ''}
            ${Array.isArray(shortestPath) && shortestPath.includes(node.id) ? 'path-node' : ''}
            ${selectedNode === node.id ? 'selected-node' : ''}
          `}
          onClick={(e) => {
              e.stopPropagation(); // prevent triggering canvas click
              handleNodeClick(node.id);
            }}
          key={node.id}
          style={{
            position: 'absolute',
            top: node.y,
            left: node.x,
          }}
        >
          {node.id}
        </div>
      ))}
    </div>
  );
}

export default GraphCanvas;


