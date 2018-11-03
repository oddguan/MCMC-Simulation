'use strict';
const jsnx = require('jsnetworkx');
const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Argument parser'
});

let parseArgument = () => {
  /* 
    Adding arguments, providing options
    This function returns the parsed argument. It is called in the first line of 
    the main function
  */

  parser.addArgument(['-T'], {
    help: 'Hyperparameter T',
    defaultValue: 300
  });
  parser.addArgument(['-r'], {
    help: 'Hyperparameter r',
    defaultValue: 1
  });
  parser.addArgument(['-i', '--iteration'], {
    help: 'Number of iterations',
    defaultValue: 10000
  });
  parser.addArgument(['-n', '--NumVertices'], {
    help: 'Number of vertices in the graph',
    defaultValue: 4
  });
  parser.addArgument(['-b', '--burnin'], {
    help: 'A flag to specify whether burn in or not',
    defaultValue: false
  });
  parser.addArgument(['-c', '--coordinates'], {
    help: 'The initial coordinates of each node',
    defaultValue: [0, 1, 1, 1, 3, 2, 1, 5]
  });

  // Parse arguments into namespace variables
  let args = parser.parseArgs();
  return args;
};

let calculateDistance = (a, b) => {
  /*
    Calculate the distance between two nodes by using their coordinates
    Return the Euclidean distance
  */
  return Math.sqrt(
    Math.pow(a.coordinate[0] - b.coordinate[0], 2) +
      Math.pow(a.coordinate[1] - b.coordinate[1], 2)
  );
};

// Main method
if (require.main === module) {
  let args = parseArgument();
  let g = new jsnx.Graph();
  let list = Array(0);
  for (let i = 0; i < args.NumVertices; i++) {
    g.addNode(i, {
      coordinate: [args.coordinates[2 * i], args.coordinates[2 * i + 1]]
    });
    if (i < args.NumVertices - 1) list.push([i, i + 1]);
  }
  list.forEach(e => {
    e.push(calculateDistance(g.node.get(e[0]), g.node.get(e[1])));
    g.addWeightedEdgesFrom([e]);
  });
}
