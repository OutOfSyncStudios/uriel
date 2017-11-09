// app.js
/* eslint no-console: "off" */

const __ = require('lodash');
const fs = require('fs');
const program = require('commander');
const pack = require('./package.json');
const Server = require('./app/server.js');
const Logger = require('./app/lib/logger');

let config = require('./config/config');

/**
  * Class representing the app
  * @class App
  */
class App {
  constructor() {
    this.logger = {};
    this.log = {};
    this.setupLogging();
    this.commandHandler();
  }

  setupLogging() {
    this.logger = new Logger(config);
    this.log = this.logger.log;
  }

  //
  commandHandler() {
    program
      .version(pack.version)
      .option('-c, --config <filename>', 'Use the specified configuration file instead of the file in ./config/');

    program.on('--help', () => {
      console.log('');
      console.log(`  Uriel v${pack.version}`);
    });

    program.parse(process.argv);

    if (program.config) {
      this.log.info('Loading external configuration...');
      let results;
      try {
        if (program.config.substr(-3) === '.js') {
          config = require(program.config);
        } else if (program.config.substr(-5) === '.json') {
          results = fs.readFileSync(program.config);
          config = JSON.parse(results);
        } else {
          this.log.info('Invalid file provided, external configuration must end with .js or .json');
          this.log.info('Falling back to default config');
        }
        this.log.debug('Settings:');
        this.log.debug(`Polling Timer: ${config.server.pollingTimer}`);
        this.log.debug(`StatsD Host: ${config.statsd.host}:${config.statsd.port}`);
        this.log.debug(`Server Name: ${config.statsd.name}`);
      } catch (err) {
        console.log(err.stack || err);
        process.exit(1);
      }
    }
  }

  // ****************************************************************************
  //  Application Shutdown Logic
  // ***************************************************************************/
  handleSIGTERM() {
    this.close(15);
  }

  handleSIGINT() {
    this.close(2);
  }

  close(code) {
    let sigCode;
    code = code || 0;
    switch (code) {
      case 2:
        sigCode = 'SIGINT';
        break;
      case 15:
        sigCode = 'SIGTERM';
        break;
      default:
        sigCode = code;
        break;
    }

    // Perform gracful shutdown here
    this.log.info(`Received exit code ${sigCode}, performing graceful shutdown`);
    if (!__.isNull(this.server) && !__.isUndefined(this.server)) {
      this.server.close();
    }
    // Shutdown the server
    // End the process after allowing time to close cleanly
    setTimeout(
      (errCode) => {
        process.exit(errCode);
      },
      config.server.shutdownTime,
      code
    );
  }

  // ****************************************************************************
  // Application Initialization Logic
  // ***************************************************************************/
  init() {
    // Setup graceful exit for SIGTERM and SIGINT
    process.on('SIGTERM', this.handleSIGTERM.bind(this));
    process.on('SIGINT', this.handleSIGINT.bind(this));

    // Start Logging & Server
    this.log.debug(config);
    this.server = new Server(config, this.log);
    this.server.init();
  }
}

const app = new App();
app.init();
