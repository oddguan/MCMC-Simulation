# mcmc-simulation [![Build Status](https://travis-ci.org/oddguan/MCMC-Simulation.svg?branch=master)](https://travis-ci.org/oddguan/MCMC-Simulation)[![Coverage Status](https://coveralls.io/repos/github/oddguan/MCMC-Simulation/badge.svg?branch=master)](https://coveralls.io/github/oddguan/MCMC-Simulation?branch=master)
> Markov Chain Monte Carlo with Metropolis-Hastings Algorithm implemented in Node.js

## Introduction

This is a project that I did for applying the Metropolis-Hastings Algorithm onto a undirected weighted graph. The program starts by specifying the number of nodes on the graph, the coordinates of nodes, and the number of timesteps for the markov chain.
The relative probability of going from one state to another is calculated by the following equation: 

![alt text](images/energy_function.png "energy function")

where:

![alt text](images/theta.png "energy function")

The first term calculates the total weight of the edges in the graph, and the second term calculates the total weights of going from one source node s to every other node in the graph through shortest path.

The proposal distribution is defined as followed:

![alt text](images/qij.png "qij")

![alt text](images/qji.png "qji")

where qij defines the probability of going to the new state, and qji defines the probability of going back to the current state from new state. With all of these, we can finally calculates the final Metropolis-Hastings probability:

![alt text](images/transitional_probability.png "energy function")


## Installation

```sh
$ git clone https://github.com/oddguan/MCMC-Simulation
$ cd MCMC-Simulation
$ npm install --save mcmc-simulation
```

## Usage

To run the program in the simplest form, simply use:
```sh
$ node lib/index.js
```

### Arguments:

* `-t/--Temperature`: The T variable specified in first equation above.
* `-r`: The r variable specified in the first equation above.
* `-i/--iteration`: The number of time steps that the markov chain goes through
* `-n/--NumVertices`: The number of vertices that are going to be presented in the graph
* `-b/--burnin`: A flag to specify whether burn-in or not (still work-in-progess)
* `-c/--coordinates`: The coordinates of the nodes

## TODO

* Burn-in functionality is currently not supported. Will be updated in the near future.


## License

MIT © [Chenxiao Guan]()
