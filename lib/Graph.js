'use strict';

class Graph {
  constructor(noOfVertices) {
    this.noOfVertices = noOfVertices;
    this.AdjList = new Map();
  }

  addVertex(v) {
    this.AdjList.set(v, []);
  }

  // Add edge to the graph
  addEdge(v, w) {
    this.AdjList.get(v).push(w);
    this.AdjList.get(w).push(v);
  }

  printGraph() {
    let getKeys = this.AdjList.keys();
    for (let i of getKeys) {
      let getValues = this.AdjList.get(i);
      let conc = '';
      for (let j of getValues) {
        conc += j + ' ';
      }
      console.log(i + ' -> ' + conc);
    }
  }

  // Main DFS method
  dfs(startingNode) {
    let visited = [];
    for (var i = 0; i < this.noOfVertices; i++) {
      visited[i] = false;
    }
    this.DFSUtil(startingNode, visited);
  }
  // Recursive function which process and explore
  // All the adjacent vertex of the vertex with which it is called

  DFSUtil(vert, visited) {
    visited[vert] = true;
    console.log(vert);
    let getNeighbours = this.AdjList.get(vert);
    for (let i in getNeighbours) {
      if (Object.prototype.hasOwnProperty.call(getNeighbours, i)) {
        let getElem = getNeighbours[i];
        if (!visited[getElem]) {
          this.DFSUtil(getElem, visited);
        }
      }
    }
  }
}

let g = new Graph(6);
let vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
// Adding vertices
for (var i = 0; i < vertices.length; i++) {
  g.addVertex(vertices[i]);
}
// Adding edges
g.addEdge('A', 'B');
g.addEdge('A', 'D');
g.addEdge('A', 'E');
g.addEdge('B', 'C');
g.addEdge('D', 'E');
g.addEdge('E', 'F');
g.addEdge('E', 'C');
g.addEdge('C', 'F');

g.printGraph();
