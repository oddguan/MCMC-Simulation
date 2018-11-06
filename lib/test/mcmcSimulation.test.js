/* eslint-env mocha */
const assert = require('assert').strict
const mcmc = require('../index.js')

describe('mcmc graph simulation function parseArgument tests', () => {
  /*
  First two elements of each argv variable are all '_' because
  the first two elements are usually the path to 'node', and the path
  to the script file, and they generally won't be used by my program,
  and won't be parsed by the parser either.
  */
  it('function parseArgument test 1', () => {
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
    assert.deepStrictEqual(argsDefault.coordinates, [0, 1, 1, 1, 3, 2, 1, 5, 7, 10])
  })

  it('function parseArgument test 2', () => {
    const argv1 = [
      '_',
      '_',
      '-i',
      '10000',
      '-n',
      '6',
      '-t',
      '250',
      '-r',
      '1.5',
      '-b',
      'false',
      '-c',
      '[0, 1, 1, 1, 3, 2, 1, 5, 7, 10]'
    ]
    // test the first set of arguments, which gives arguments by using the first letter
    process.argv = argv1
    let args1 = mcmc.parseArgument()
    assert.strictEqual(args1.Temperature, 250)
    assert.strictEqual(args1.r, 1.5)
    assert.strictEqual(args1.iteration, 10000)
    assert.strictEqual(args1.NumVertices, 6)
    assert.strictEqual(args1.burnin, false)
    assert.deepStrictEqual(args1.coordinates, [0, 1, 1, 1, 3, 2, 1, 5, 7, 10])
  })

  it('function parseArgument test 3', () => {
    const argv2 = [
      '_',
      '_',
      '--iteration',
      '20000',
      '--NumVertices',
      '5',
      '--burnin',
      'true',
      '--coordinates',
      '[0, 1, 1, 4, 3, 2, 1, 2, 7, 10]',
      '-r',
      '5',
      '--Temperature',
      '100'
    ]
    // test the second set of arguments, which gives arguments by using full names
    process.argv = argv2
    let args2 = mcmc.parseArgument()
    assert.strictEqual(args2.Temperature, 100)
    assert.strictEqual(args2.r, 5)
    assert.strictEqual(args2.iteration, 20000)
    assert.strictEqual(args2.NumVertices, 5)
    assert.strictEqual(args2.burnin, true)
    assert.deepStrictEqual(args2.coordinates, [0, 1, 1, 4, 3, 2, 1, 2, 7, 10])
  })
})
