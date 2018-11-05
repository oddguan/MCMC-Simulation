/* eslint-env mocha */
const assert = require('assert')
const mcmcSimulation = require('../index.js')

describe('mcmcSimulation', () => {
  it('has a test', () => {
    assert(true, 'mcmcSimulation should have a test')
  })
})

describe('add test', () => {
  it('testing the add point function', () => {
    let mcmc1 = new mcmcSimulation.Operation(3, 2)
    assert.equal(mcmc1.addPoints(), 5)
    let mcmc2 = new mcmcSimulation.Operation(-3, 0)
    assert.equal(-3, mcmc2.addPoints())
  })
})
