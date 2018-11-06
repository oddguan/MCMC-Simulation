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
    defaultValue: 4
  })
  parser.addArgument(['-b', '--burnin'], {
    help: 'A flag to specify whether burn in or not',
    defaultValue: false
  })
  parser.addArgument(['-c', '--coordinates'], {
    help: 'The initial coordinates of each node',
    defaultValue: [0, 1, 1, 1, 3, 2, 1, 5, 7, 10]
  })

  // Parse arguments into namespace variables
  let args = parser.parseArgs()
  return args
}
let addCoordinates = (g, NumVertices, coordinates) => {
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
  let result = (-(thetaj - thetai)) / T
  result = Math.exp(result)
  return result
}

let include = (edges, toBeAdded) => {
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
  let newG = new jsnx.Graph()
  let edges = []
  g.nodes().forEach(n => {
    newG.addNode(n, { coordinate: g.node.get(n).coordinate })
  })
  edges = g.edges()
  edges.forEach(e => {
    e.push(g.getEdgeData(e[0], e[1]).weight)
  })
  newG.addWeightedEdgesFrom(edges)
  return newG
}

let addOrDelete = (g, n) => {
  let aOD = false
  let newG = copyGraph(g)
  let bList = bridges(newG)
  let randomNumber = Math.random()
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
  // console.log(E, B, n)
  let qji, qij, M
  if (aOD) {
    if (E === B) {
      return 1
    } else {
      M = n * (n - 1) / 2 - E
      qji = 1 / M
      qij = 1 / (E - B)
    }
  } else {
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
  if (g1.edges().toString() === g2.edges().toString()) {
    if (g1.nodes().toString() === g2.nodes().toString()) {
      return true
    }
  }
  return false
}

let mcmc = (g, r, T, s, NumVertices, iteration) => {
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

let main = () => {
  let args = parseArgument()
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
  console.log('the final optimal graph: ', optimalGraph.edges())
  console.log('Occurance: ', optimalValue)
}

// Main method
if (require.main === module) {
  main()
}

module.exports = {
  parseArgument,
  addCoordinates,
  calculateDistance,
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
  main
}
