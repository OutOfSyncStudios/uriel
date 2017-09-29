// app/lib/logger.js

// Dependencies
const
  _                 = require('./lodashExt')
  , fs                = require('fs')
  , moment            = require('moment')
  , winston           = require('winston')
;

class Logger {
  /**
   * A utility class to wrap Winston logging
   * @class Logger
   * @param {object} config - A global configuration object that may contain options on how to initialize the logger
   * @example
   * let logger = new logger(config);
   */
  constructor(config) {
    this.logDir = config.logging.logDir || './logs';

    let transports = [
      new (winston.transports.File) ({
        filename: this.logDir + '/info.log',
        name: 'info-log',
        level: 'info',
        formatter: this.formatter
      }),
      new (winston.transports.File) ({
        filename: this.logDir + '/error.log',
        name: 'error-log',
        level: 'error',
        formatter: this.formatter
      })
    ];

    // Optimization -- Add console logging if not in production
    if ((process.env.NODE_ENV !== 'production') && (process.env.NODE_ENV !== 'test')) {
      transports.push(
        new (winston.transports.Console) ({
          level: 'debug',
          formatter: this.formatter
        })
      );

      transports.push(
        new (winston.transports.File) ({
          filename: this.logDir + '/debug.log',
          name: 'debug-log',
          level: 'debug',
          formatter: this.formatter
        })
      );
    }

    this.options = {
      exitOnError: false,
      formatter: this.formatter,
      transports: transports
    };

    // Create log folder if it does not already exist
    if (!fs.existsSync(config.logging.logDir)) {
      console.log('Creating log folder');
      fs.mkdirSync(config.logging.logDir);
    }

    // Merge options from config into this object
    this.option = _.assign(this.options, config.logging.options);
    this.log = new (winston.Logger) (this.options);
  }

  formatter(options) {
    return `${new Date().toISOString()} [${options.level.toUpperCase()}]: ${options.message}`;
  }

  handleError(err) {
    if (this.log) { this.log.error(err); };
  }
}

module.exports = Logger;
