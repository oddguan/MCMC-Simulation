/* eslint-env mocha */
const assert = require('assert').strict
const mcmc = require('../index.js')
const jsnx = require('jsnetworkx')

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
    assert.strictEqual(argsDefault.NumVertices, 4)
    assert.strictEqual(argsDefault.burnin, false)
    assert.deepStrictEqual(argsDefault.coordinates, '[0,1,1,1,3,2,1,5,7,10]')
  })

  it('function addCoordinates test', () => {
    let g = new jsnx.Graph()
    let coordinates = [1, 2, 3, 4, 5, 6, 7, 8]
    const NumVertices = 4
    mcmc.addCoordinates(g, NumVertices, coordinates)
    for (let i = 0; i < 4; i++) {
      assert.deepStrictEqual(g.node.get(i).coordinate, [coordinates[2 * i], coordinates[2 * i + 1]])
    }
  })

  it('function calculateDistance test', () => {
    const a = { coordinate: [3, 2] }
    const b = { coordinate: [0, 0] }
    const cal = Math.sqrt(Math.pow(3, 2) + Math.pow(2, 2))
    assert.strictEqual(mcmc.calculateDistance(a, b), cal)
  })

  it('function dfs test', () => {
    let g = new jsnx.Graph()
    let cycle = [1, 2, 3, 4, 5]
    g.addCycle(cycle)
    let dfsCycle = mcmc.dfs(g, 1, undefined)
    assert.deepStrictEqual(dfsCycle, cycle)
  })
})
