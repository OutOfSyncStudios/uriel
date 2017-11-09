// app/monitors/index.js

const fs = require('fs'), path = require('path');

const monitors = {};

/*
 * This iterates through all .js files in the routes folder and loads them in
 * to the `monitors`` object. The purpose of this is to separate each of
 * the monitor logics into its own file class for easie maintainability of the code.
 *
 * The `monitorr` object is returned to the paired `require('thisLib')` statement
 * inside the host code.
 */
module.exports = (hostname, statsd, log) => {
  log.debug(' - Loading Monitor - ');
  fs
    .readdirSync(__dirname)
    .filter((file) => {
      return file.substr(-3) === '.js' && file.indexOf('.') !== 0 && file !== 'index.js';
    })
    .forEach((file) => {
      const ProxyClass = require(path.join(__dirname, file));
      log.debug(`Loading monitor: '${ProxyClass.name}'`);
      monitors[ProxyClass.name] = new ProxyClass(hostname, statsd, log);
    });
  return monitors;
};
