// test/index.js

const fs = require('fs');
const path = require('path');

/*
 * This iterates through all .js files in the test folder and loads them in
 * the mocha test runner. The purpose of this is to allow for the separation of
 * unit tests based on the logic of each model for easier maintainability of the
 * unit test code.
 *
 */
/* eslint-disable no-console */
process.env.NODE_ENV = 'production';
// Set the environment to testing
console.log('Loading Tests...');
fs
  .readdirSync(__dirname)
  .filter((file) => {
    return file.substr(-3) === '.js' && file.indexOf('.') !== 0 && file !== 'index.js';
  })
  .forEach((file) => {
    const name = file.substr(0, file.indexOf('.'));
    console.log(`Loading Test: '${name}'`);
    require(path.join(__dirname, file));
  });
