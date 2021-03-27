// app/lib/logger.js

// Dependencies
const assign = require('lodash.assign');
const fs = require('fs');
const winston = require('winston');
const { format } = winston;

/**
 * A utility class to wrap Winston logging
 * @class Logger
 * @param {object} config - A global configuration object that may contain options on how to initialize the logger
 * @example
 * let logger = new logger(config);
 */
class Logger {
  constructor(config) {
    this.logDir = config.logging.logDir || './logs';

    const transports = [
      new winston.transports.File({
        filename: `${this.logDir}/info.log`,
        name: 'info-log',
        level: 'info',
        format: format.printf(this.formatter)
      }),
      new winston.transports.File({
        filename: `${this.logDir}/error.log`,
        name: 'error-log',
        level: 'error',
        format: format.printf(this.formatter)
      })
    ];

    // Optimization -- Add console logging if not in production
    // if ((process.env.NODE_ENV !== 'production') && (process.env.NODE_ENV !== 'test')) {
    transports.push(new winston.transports.Console({ level: 'debug', formatter: this.formatter }));

    this.options = {
      exitOnError: false,
      format: winston.format.printf(this.formatter),
      transports: transports
    };

    // Create log folder if it does not already exist
    if (!fs.existsSync(config.logging.logDir)) {
      console.log('Creating log folder');
      fs.mkdirSync(config.logging.logDir);
    }

    // Merge options from config into this object
    this.options = assign(this.options, config.logging.options);
    this.log = winston.createLogger(this.options);
  }

  formatter(options) {
    let message = options.message;
    if (!message) {
      message = JSON.parse(options[Symbol.for('message')])['@message'];
    }
    return `${new Date().toISOString()} [${options.level.toUpperCase()}]: ${message}`;
  }

  handleError(err) {
    if (this.log) {
      this.log.error(err);
    }
  }
}

module.exports = Logger;
