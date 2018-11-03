'use strict';
const jsnx = require('jsnetworkx');
const ArgumentParser = require('argparse').ArgumentParser;
const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Argument parser'
});

// Adding arguments, providing options
parser.addArgument(['-T'], {
  help: 'Hyperparameter T',
  required: true
});
parser.addArgument(['-r'], {
  help: 'Hyperparameter r',
  required: true
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

// Parse arguments into namespace variables
const args = parser.parseArgs();

let g = new jsnx.Graph();
for (let i = 0; i < args.v; i++) {
  g.addNode(i);
}
