// app.js
let
  _                   = require('lodash')
  , fs                = require('fs')
  , program           = require('commander')
  , config            = require('./config/config')
  , pack              = require('./package.json')
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
    this.commandHandler();
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
      console.log("Loading external configuration...");
      let results, data;
      try {
        if (program.config.substr(-3) === '.js') {
          config = require(program.config);
        }
        else if (program.config.substr(-5) === '.json') {
          results = fs.readFileSync(program.config);
          data = JSON.parse(results);
          config = data;
        } else {
          console.log("Invalid file provided, external configuration must end with .js or .json");
          console.log("Falling back to default config");
        }
      } catch(err) {
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
