// app.js
let
  _                   = require('lodash')
  , fs                = require('fs')
  , config            = require('./config/config')
  , Server            = require('./app/server.js')

  , Logger            = require('./app/lib/logger')
;

/**
  * Class representing the app
  * @class App
  */
class App {
  constructor() {
    this.logger = {};
    this.log = {};
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
    if (!_.isNull(this.server) && !_.isUndefined(this.server)) this.server.close();   // Shutdown the server

    // End the process after allowing time to close cleanly
    setTimeout((c) => { process.exit(c); }, config.server.shutdownTime, code);
  }

  // ****************************************************************************
  // Application Initialization Logic
  // ***************************************************************************/
  init() {
    // Setup graceful exit for SIGTERM and SIGINT
    process.on('SIGTERM', this.handleSIGTERM.bind(this));
    process.on('SIGINT', this.handleSIGINT.bind(this));

    // Start Logging & Server
    this.setupLogging();
    this.log.debug(config);
    this.server = new Server(config, this.log);
    this.server.init();
  }

  setupLogging() {
    this.logger = new Logger(config);
    this.log = this.logger.log;
  }

}

let app = new App();
app.init();
