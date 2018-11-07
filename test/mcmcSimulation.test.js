/* eslint-env mocha */
const assert = require('assert').strict
const mcmc = require('../lib/index.js')
const jsnx = require('jsnetworkx')

// suppressing console log
before(function () {
  // silence the console
  console.log = function () {}
})

after(function () {
  // reset console
  delete console.log
})

describe('mcmc graph simulation unit tests', () => {
  /*
  First two elements of each argv variable are all '_' because
  the first two elements are usually the path to 'node', and the path
  to the script file, and they generally won't be used by my program,
  and won't be parsed by the parser either.
  */
  it('function parseArgument test', () => {
    const argvDefault = [
      '_',
      '_'
    ]

    // test the default argument parser
    process.argv = argvDefault
    let argsDefault = mcmc.parseArgument()
    assert.strictEqual(argsDefault.Temperature, 300)
    assert.strictEqual(argsDefault.r, 1)
    assert.strictEqual(argsDefault.iteration, 1000)
    assert.strictEqual(argsDefault.NumVertices, 5)
    assert.strictEqual(argsDefault.burnin, false)
    assert.deepStrictEqual(argsDefault.coordinates, '[0,1,1,1,3,2,1,5,7,10]')
  })

  it('function addCoordinates test', () => {
    let g = new jsnx.Graph()
    let coordinates = [1, 2, 3, 4, 5, 6, 7, 8]
    const NumVertices = 4
    mcmc.addCoordinates(g, NumVertices, coordinates)
    for (let i = 0; i < 4; i++) {
      // check each coordinate is the same as given
      assert.deepStrictEqual(g.node.get(i).coordinate, [coordinates[2 * i], coordinates[2 * i + 1]])
    }
  })

  it('function calculateDistance test', () => {
    // check if the Euclidean distance calculation is correct
    const a = { coordinate: [3, 2] }
    const b = { coordinate: [0, 0] }
    const cal = Math.sqrt(Math.pow(3, 2) + Math.pow(2, 2))
    assert.strictEqual(mcmc.calculateDistance(a, b), cal)
  })

  it('function dfs test', () => {
    // dfs through a cycle should just be the cycle in order
    let g = new jsnx.Graph()
    let cycle = [1, 2, 3, 4, 5]
    g.addCycle(cycle)
    let dfsCycle = mcmc.dfs(g, 1)
    assert.deepStrictEqual(dfsCycle, cycle)
  })

  it('function isConnected test', () => {
    // makes two graphs, one connected one disconnected, check the output
    let g = new jsnx.Graph()
    const nodes = [0, 1, 2, 3]
    g.addNodesFrom(nodes)
    g.addEdgesFrom([[0, 1], [0, 2], [0, 3]])
    assert.ok(mcmc.isConnected(g))
    g = new jsnx.Graph()
    g.addNodesFrom(nodes)
    g.addEdgesFrom([[0, 1], [0, 2]])
    assert.ok(!mcmc.isConnected(g))
  })

  it('function bridges test', () => {
    // make two graphs, one has two bridges one has zero bridges, check the output
    let g = new jsnx.Graph()
    let nodes = [0, 1, 2]
    g.addNodesFrom(nodes)
    g.node.get(0).coordinate = [1, 2]
    g.node.get(1).coordinate = [3, 4]
    g.node.get(2).coordinate = [0, -1]
    g.addEdgesFrom([[0, 1], [0, 2]])
    assert.strictEqual(mcmc.bridges(g).length, 2)
    g = new jsnx.Graph() // another graph
    nodes = [0, 1, 2, 3]
    g.addNodesFrom(nodes)
    g.node.get(0).coordinate = [1, 2]
    g.node.get(1).coordinate = [3, 4]
    g.node.get(2).coordinate = [0, -1]
    g.node.get(3).coordinate = [2, 7]
    g.addEdgesFrom([[0, 1], [1, 2], [2, 3], [0, 3], [1, 3], [0, 2]])
    assert.strictEqual(mcmc.bridges(g).length, 0)
  })

  it('function calculateTheta test', () => {
    // check the theta calculation is correct
    let g = new jsnx.Graph()
    g.addNodesFrom([0, 1, 2, 3])
    g.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1], [2, 3, 1]])
    assert.strictEqual(mcmc.calculateTheta(1, g, 0), 9)
  })

  it('function calculatePiOverPi test', () => {
    const theta1 = 5
    const theta2 = 10
    const T = 300
    assert.strictEqual(Math.exp(-(theta1 - theta2) / T), mcmc.calculatePiOverPi(theta1, theta2, T))
  })

  it('function include test', () => {
    let edges = [[1, 2], [3, 4], [5, 6]]
    let e = [1, 2]
    assert.ok(mcmc.include(edges, e))
    edges = [[2, 1], [3, 4]]
    assert.ok(mcmc.include(edges, e))
    e = [0, 1]
    assert.ok(!mcmc.include(edges, e))
  })

  it('function copyGraph test', () => {
    let g = new jsnx.Graph()
    const nodes = [0, 1, 2, 3]
    g.addNodesFrom(nodes)
    let copied = mcmc.copyGraph(g)
    let newG = new jsnx.Graph()
    newG.addNodesFrom(nodes)
    assert.deepStrictEqual(copied.nodes(), newG.nodes())
  })

  it('function addOrDelete test', () => {
    let g = new jsnx.Graph()
    let n = 3
    let nodes = [0, 1, 2]
    // complete graph, can only delete
    g.addNodesFrom(nodes)
    g.node.get(0).coordinate = [0, 0]
    g.node.get(1).coordinate = [0, 1]
    g.node.get(2).coordinate = [0, -1]
    g.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 1], [1, 2, 2]])
    // the second argument returned is a flag showing whether added or deleted
    // checking the flag to make sure it is working correctly
    let result = mcmc.addOrDelete(g, n)
    assert.ok(!result[1])
    g.removeEdge(1, 2) // incomplete graph with all bridges, so can only add new edge
    result = mcmc.addOrDelete(g, n)
    assert.ok(result[1])
  })

  it('function calculateQRatio test', () => {
    assert.strictEqual(mcmc.calculateQRatio(3, 3, 0, true), 1)
    assert.strictEqual(mcmc.calculateQRatio(3, 3, 0, false), 0)
    assert.strictEqual(mcmc.calculateQRatio(3, 2, 4, true), 3)
    assert.strictEqual(mcmc.calculateQRatio(3, 2, 4, false), 0.25)
  })

  it('function checkEqual test', () => {
    let g1 = new jsnx.Graph()
    let g2 = new jsnx.Graph()
    const nodes = [0, 1, 2]
    const edges = [[1, 2], [0, 1], [0, 2]]
    g1.addNodesFrom(nodes)
    g1.addEdgesFrom(edges)
    g2.addNodesFrom(nodes)
    g2.addEdgesFrom(edges)
    assert.ok(mcmc.checkEqual(g1, g2))
  })

  it('function mcmc test', () => {
    let g = new jsnx.Graph()
    let nodes = [0, 1, 2]
    g.addNodesFrom(nodes)
    g.node.get(0).coordinate = [0, 0]
    g.node.get(1).coordinate = [0, 1]
    g.node.get(2).coordinate = [0, -1]
    g.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 1], [1, 2, 2]])
    let chain = mcmc.mcmc(g, 1, 1, 0, 3, 5)
    let sum = 0
    chain.forEach((v, k, m) => {
      sum += v
    })
    assert.strictEqual(sum, 5)
  })

  it('function main test', () => {
    process.argv = ['_', '_']
    let args = {
      Temperature: 300,
      r: 1,
      iteration: 5,
      NumVertices: 3,
      burnin: false,
      coordinates: '[0,1,0,-1,-1,1]'
    }
    mcmc.main(args)
  })

  it('function calculateEConnectedZero test', () => {
    let chain = new Map()
    let g = new jsnx.Graph()
    g.addNodesFrom([0, 1, 2, 3])
    g.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 2], [0, 3, 3]])
    chain.set(g, 5)
    g = new jsnx.Graph()
    g.addNodesFrom([0, 1, 2, 3])
    g.addWeightedEdgesFrom([[0, 1, 1], [0, 2, 2], [2, 3, 1]])
    chain.set(g, 3)
    let E = mcmc.calculateEConnectedZero(chain)
    assert.strictEqual(E, (6 + 15) / 8)
  })

  it('function calculateEEntireGraph test', () => {
    let chain = new Map()
    let g = new jsnx.Graph()
    g.addEdgesFrom([[1, 2], [3, 4], [5, 6]])
    chain.set(g, 10)
    g = new jsnx.Graph()
    g.addEdgesFrom([[1, 2]])
    chain.set(g, 3)
    g = new jsnx.Graph()
    g.addEdgesFrom([[4, 5], [2, 1]])
    chain.set(g, 4)
    let expected = (3 * 10 + 1 * 3 + 2 * 4) / (10 + 3 + 4)
    assert.strictEqual(mcmc.calculateEEntireGraph(chain), expected)
  })

  it('function calculateDistanceShortestPath test', () => {
    let chain = new Map()
    let g = new jsnx.Graph()
    g.addNodesFrom([0, 1, 2, 3])
    g.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1], [2, 3, 1]])
    chain.set(g, 3)
    g = new jsnx.Graph()
    g.addNodesFrom([0, 1, 2, 3])
    g.addWeightedEdgesFrom([[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 2]])
    chain.set(g, 2)
    const expected = ((1 + 2 + 3) * 3 + (1 + 2 + 2) * 2) / 5
    assert.strictEqual(mcmc.calculateDistanceShortestPath(chain, 4), expected)
  })
})
