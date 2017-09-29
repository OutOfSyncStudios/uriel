// app/monitors/index.js

const
  _                 = require('lodash')
  , fs                = require('fs')
  , path              = require('path')
;

let monitors = {};

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
   fs.readdirSync(__dirname)
     .filter(function(file) {
       return (file.substr(-3) === '.js') && (file.indexOf('.') !== 0) && (file !== 'index.js');
     })
     .forEach(function(file) {
       let cls = require(path.join(__dirname, file));
       log.debug(`Loading monitor: '${cls.name}'`);
       monitors[cls.name] = new cls(hostname, statsd, log);
     });
   return monitors;
 }
