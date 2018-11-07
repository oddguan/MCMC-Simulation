'use strict'
const jsnx = require('jsnetworkx')
const ArgumentParser = require('argparse').ArgumentParser
const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Argument parser'
})

let parseArgument = () => {
  /*
    Adding arguments, providing options
    This function returns the parsed argument. It is called in the first line of
    the main function
  */
  parser.addArgument(['-t', '--Temperature'], {
    help: 'Hyperparameter T',
    defaultValue: 300
  })
  parser.addArgument(['-r'], {
    help: 'Hyperparameter r',
    defaultValue: 1
  })
  parser.addArgument(['-i', '--iteration'], {
    help: 'Number of iterations',
    defaultValue: 1000
  })
  parser.addArgument(['-n', '--NumVertices'], {
    help: 'Number of vertices in the graph',
    defaultValue: 5
  })
  parser.addArgument(['-b', '--burnin'], {
    help: 'A flag to specify whether burn in or not',
    defaultValue: false
  })
  parser.addArgument(['-c', '--coordinates'], {
    help: 'The initial coordinates of each node',
    defaultValue: '[0,1,1,1,3,2,1,5,7,10]'
  })

  // Parse arguments into namespace variables
  let args = parser.parseArgs()
  return args
}
let addCoordinates = (g, NumVertices, coordinates) => {
  /*
  This function adds coordinates given by cli to the graph
  It calls the calculateDistance function to calculate the Euclidean distance
  between two nodes.
  */
  let list = Array(0)
  for (let i = 0; i < NumVertices; i++) {
    g.addNode(i, {
      coordinate: [coordinates[2 * i], coordinates[2 * i + 1]]
    })
    if (i < NumVertices - 1) list.push([i, i + 1])
  }
  list.forEach(e => {
    e.push(calculateDistance(g.node.get(e[0]), g.node.get(e[1])))
    g.addWeightedEdgesFrom([e])
  })
}

let calculateDistance = (a, b) => {
  /*
    Calculate the distance between two nodes by using their coordinates
    Return the Euclidean distance
  */
  // console.log(a, b)
  return Math.sqrt(
    Math.pow(a.coordinate[0] - b.coordinate[0], 2) +
      Math.pow(a.coordinate[1] - b.coordinate[1], 2)
  )
}

let dfs = (g, start, visited) => {
  /*
  Doing a recursive depth first search on the given graph, starting at the given
  starting node. This is used as a helper function to see  if a graph is connected or not,
  and to check if two graphs are the same or not
  */
  if (visited === undefined) {
    visited = new Array(0)
  }
  visited.push(start)
  g.neighbors(start).forEach(neighbor => {
    if (!visited.includes(neighbor)) {
      dfs(g, neighbor, visited)
    }
  })
  return visited
}

let isConnected = g => {
  /*
  Do a DFS on the given graph. If the array contains each node after DFS,
  the graph is connected. If not, the graph is not connected
  */
  let rn = Math.floor(Math.random() * g.nodes().length)
  let visited = dfs(g, rn)
  visited.sort()
  if (visited.toString() !== g.nodes().toString()) {
    return false
  } else {
    return true
  }
}

let bridges = g => {
  /*
  Return all bridges for a given graph
  return an empty array if there is no bridges in the graph
  */

  let bridgesArray = new Array(0)
  if (!isConnected(g)) {
    return new Array(0)
  } else {
    g.edges().forEach(e => {
      let temp = e
      g.removeEdge(temp[0], temp[1])
      if (!isConnected(g)) {
        bridgesArray.push(e)
        temp.push(calculateDistance(g.node.get(temp[0]), g.node.get(temp[1])))
        g.addWeightedEdgesFrom([temp])
      } else {
        temp.push(calculateDistance(g.node.get(temp[0]), g.node.get(temp[1])))
        g.addWeightedEdgesFrom([temp])
      }
    })
    return bridgesArray
  }
}

let calculateTheta = (r, g, s) => {
  /*
  Calculate the theta term (energy) in the Metropolis Hastings Algorithm probability
  It loops through all nodes in the graph, starting at a source node, runs dijkstra's algorithm
  to find the shortest path between two nodes, and add them into the final result
  */
  let theta = 0
  g.edges().forEach(edge => {
    theta += g.getEdgeData(edge[0], edge[1]).weight
  })
  theta *= r
  g.nodes().forEach(node => {
    theta += jsnx.dijkstraPathLength(g, { source: s, target: node })
  })
  return theta
}

let calculatePiOverPi = (thetaj, thetai, T) => {
  /*
  given two theta values and temperature, calculate the pi term in the final equation.
  Note that if T is 0, the program maybe won't work, and T should always be a positive
  number. Intuitively, when T approaches 0, the program will tend to freeze at a state
  and will always reject the newer proposed state. If the T is high enough, the proposed
  state will always be accepted.
  */
  let result = (-(thetaj - thetai)) / T
  result = Math.exp(result)
  return result
}

let include = (edges, toBeAdded) => {
  /*
  A helper function to check if a edge to be added into a graph is already exsiting in
  the graph or not. This function is important since JavaScript does not support includes
  with 2d Arrays. Also, this function checks if the reverse is also true, since, say [1,2]
  and [2,1], are the same in undirected graphs
  */
  let flag = false
  edges.forEach(e => {
    if (e[0] === toBeAdded[0] && e[1] === toBeAdded[1]) {
      flag = true
    } else if (e[0] === toBeAdded[1] && e[1] === toBeAdded[0]) {
      flag = true
    }
  })
  return flag
}

let copyGraph = (g) => {
  /*
  This function returns a new graph that is just like the g given to the function.
  It is used to generate a new proposed state.
  */
  let newG = new jsnx.Graph()
  let edges = []
  g.nodes().forEach(n => { // add each node
    newG.addNode(n, { coordinate: g.node.get(n).coordinate })
  })
  edges = g.edges() // add each edge
  edges.forEach(e => { // add weights
    e.push(g.getEdgeData(e[0], e[1]).weight)
  })
  newG.addWeightedEdgesFrom(edges)
  return newG
}

let addOrDelete = (g, n) => {
  /*
  This function determines what is the operation to go from one state to another.
  It either adds an edge or delete an edge in the current state of the graph.
  */
  let aOD = false // flag to show whether added or deleted
  let newG = copyGraph(g)
  let bList = bridges(newG)
  let randomNumber = Math.random() // >=0.5 add, <0.5 delete
  if (bList.length === newG.edges().length) {
    randomNumber = 1
  }
  if (randomNumber >= 0.5 && newG.edges().length < (n * (n - 1) / 2)) { // add new edge
    // console.log('add edge')
    let node1, node2
    do {
      node1 = Math.floor(Math.random() * newG.nodes().length)
      node2 = node1
      while (node2 === node1) {
        node2 = Math.floor(Math.random() * newG.nodes().length)
      }
    } while (include(newG.edges(), [node1, node2]))
    // console.log(newG.edges())
    // console.log(`edge to be added: (${node1}, ${node2})`)

    let e = [[node1, node2, calculateDistance(newG.node.get(node1), newG.node.get(node2))]]
    newG.addWeightedEdgesFrom(e)
    // console.log(e)
    aOD = true
  } else {
    // console.log('delete edge')
    // console.log(bridges(g))
    let e
    bList.forEach(b => {
      b.pop()
    })
    // console.log('bList: ', bList)
    while (e === undefined || include(bList, e)) {
      e = newG.edges()[Math.floor(Math.random() * newG.edges().length)]
      // console.log('edge to be deleted: ', e)
    }
    newG.removeEdge(e[0], e[1])
    aOD = false
  }
  return [newG, aOD]
}

let calculateQRatio = (E, B, n, aOD) => {
  /*
  calculate the q term in the final equation, see details in readme
  */
  let qji, qij, M
  if (aOD) { // if added an edge
    if (E === B) {
      return 1
    } else {
      M = n * (n - 1) / 2 - E
      qji = 1 / M
      qij = 1 / (E - B)
    }
  } else { // if deleted
    if (E === B) {
      return 0
    } else {
      qij = 1 / ((n * (n - 1)) / 2 - E + 1)
      qji = 1 / (E - B)
    }
  }
  return qij / qji
}

let checkEqual = (g1, g2) => {
  /*
  checks if two given graphs are identical (isomorephic), by traversing both of them
  with a DFS algorithm
  */
  let dfsFlag = true
  let nodeFlag = true
  if (dfs(g1, 0).toString() !== dfs(g2, 0).toString()) {
    dfsFlag = false
  }
  g1.nodes().forEach(n1 => {
    if (!g2.nodes().includes(n1)) {
      nodeFlag = false
    }
  })
  return dfsFlag && nodeFlag
}

let mcmc = (g, r, T, s, NumVertices, iteration) => {
  /*
  the body of the whole process. runs through a for loop as the markov chain,
  calculates the Metropolis-Hastings probability, and moves on.
  Return a chain map to describe the frequency of each graph that occured.
  */
  let chain = new Map()
  let flag = true
  let thetai, newG, thetaj, piRatio, qRatio, acceptP, aOD, result
  for (let i = 0; i < iteration; i++) {
    console.log(`iteration ${i + 1}`)
    thetai = calculateTheta(r, g, s)
    // console.log('thetai: ', thetai)
    result = addOrDelete(g, NumVertices)
    newG = result[0]
    aOD = result[1]
    // console.log('g: ', g.edges())
    // console.log('newG: ', newG.edges())
    thetaj = calculateTheta(r, newG, s)
    // console.log('thetaj: ', thetaj)
    piRatio = calculatePiOverPi(thetaj, thetai, T)
    // console.log('piRatio: ', piRatio)
    qRatio = calculateQRatio(g.edges().length, bridges(g).length, NumVertices, aOD)
    // console.log('qRatio: ', qRatio)
    acceptP = qRatio * piRatio
    let rand = Math.random()
    if (acceptP >= 1 || rand <= acceptP) {
      // console.log('accepted')
      // console.log('before accept: ', g.edges())
      g = newG
      // console.log('after accept: ', g.edges())
    }
    flag = true
    chain.forEach((value, key, map) => {
      if (checkEqual(key, g)) {
        map.set(key, ++value)
        flag = false
      }
    })
    if (flag) {
      chain.set(g, 1)
    }
  }
  return chain
}

let calculateEConnectedZero = chain => {
  /*
  calculate the expected value of the number of edges connected to the 0 node.
  Loops through the chain map and aggregate values through.
  */
  let E = 0
  let value = 0
  chain.forEach((v, k, m) => {
    let edgeNumber = 0
    value += v
    k.edges().forEach(edge => {
      if (edge.includes(0)) {
        edgeNumber++
      }
    })
    E += edgeNumber * v
  })
  E /= value
  return E
}

let calculateEEntireGraph = chain => {
  /*
  calculates the expected number of edges in the graphs.
  */
  let E = 0
  let value = 0
  chain.forEach((v, k, m) => {
    value += v
    E += k.edges().length * v
  })
  return E / value
}

let calculateDistanceShortestPath = (chain, n) => {
  /*
  calculates the maximum shortest path connected to node 0.
  This function is confusing just as its purpose. Did it solely
  for the project requirement.
  */
  let E = 0
  let sum = 0
  let value = 0
  chain.forEach((v, k, m) => {
    sum = 0
    value += v
    for (let i = 1; i < n; i++) {
      sum += jsnx.dijkstraPathLength(k, { source: 0, target: i })
    }
    sum *= v
    E += sum
  })
  return E / value
}

let main = (args) => {
  /*
  main function of the simulator. calls each function and prints out useful stuffs.
  */
  let g = new jsnx.Graph()
  let readCoordinates = JSON.parse(args.coordinates)
  addCoordinates(g, args.NumVertices, readCoordinates)
  g.edges().forEach(edge => {
    console.log(g.getEdgeData(edge[0], edge[1]).weight)
  })
  let s = Math.floor(Math.random() * g.nodes().length)
  let chain = mcmc(g, args.r, args.Temperature, s, args.NumVertices, args.iteration)
  let sum = 0
  chain.forEach((value, key, map) => {
    console.log(key.edges(), value)
    sum += value
  })
  let optimalGraph
  let optimalValue = 0
  console.log('Source node: ', s)
  console.log('final total number of graphs generated: ', sum)
  console.log('Should be: ', args.iteration)
  chain.forEach((value, key, map) => {
    if (value > optimalValue) {
      optimalValue = value
      optimalGraph = key
    }
  })
  console.log('the most optimal graph: ', optimalGraph.edges())
  console.log('Occurance: ', optimalValue)
  console.log('Expected value for connection to 0: ', calculateEConnectedZero(chain))
  console.log('Expected value of number of edges in the graph: ', calculateEEntireGraph(chain))
  console.log('Expected value of maximum shortest path: ', calculateDistanceShortestPath(chain, args.NumVertices))
  console.log('size: ', chain.size)
}

// Main method
if (require.main === module) {
  const args = parseArgument()
  main(args)
}

// exporting each function for testing
module.exports = {
  parseArgument,
  addCoordinates,
  calculateDistance,
  dfs,
  isConnected,
  bridges,
  calculateTheta,
  calculatePiOverPi,
  include,
  copyGraph,
  addOrDelete,
  calculateQRatio,
  checkEqual,
  mcmc,
  calculateEConnectedZero,
  calculateEEntireGraph,
  calculateDistanceShortestPath,
  main
}
