export function buildAdjacencyList(nodes, edges) {
  const adjList = {};

  nodes.forEach((node) => {
    adjList[node.id] = [];
  });

  edges.forEach((edge) => {
    if (edge.direction === 'both') {
      adjList[edge.from].push({ node: edge.to, weight: edge.weight });
      adjList[edge.to].push({ node: edge.from, weight: edge.weight });
    } else if (edge.direction === 'forward') {
      adjList[edge.from].push({ node: edge.to, weight: edge.weight });
    } else if (edge.direction === 'backward') {
      adjList[edge.to].push({ node: edge.from, weight: edge.weight });
    }
  });

  return adjList;
}

export function dijkstra(adjList, startId, endId) {
  const distances = {};
  const previous = {};
  const visited = new Set();

  // Initialize distances
  for (let node in adjList) {
    distances[node] = Infinity;
    previous[node] = null;
  }
  distances[startId] = 0;

  const queue = [startId];

  while (queue.length > 0) {
    // Find node with smallest tentative distance
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === endId) break;

    for (const neighbor of adjList[current]) {
      const alt = distances[current] + neighbor.weight;
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt;
        previous[neighbor.node] = current;
        queue.push(neighbor.node);
      }
    }
  }

  return { distances, previous };
}
