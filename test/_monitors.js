// test/_monitors.js

// Dependancies
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const monitorTest = {
  cpu: null,
  disk: null,
  diskio: null,
  memory: null,
  network: null,
  swap: null,
  system: null
};

describe('Monitor Tests', () => {
  before(() => {
    // Do all necessary things here
  });

  after(() => {
    // Do all necessary things here
  });

  fs.readdirSync(`${__dirname}/monitors`)
    .filter((file) => {
      return file.substr(-3) === '.js' && file.indexOf('.') !== 0 && file !== 'index.js';
    })
    .forEach((file) => {
      const fullPath = path.join(`${__dirname}/monitors`, file);
      require(fullPath)(config, monitorTest);
    });
});
