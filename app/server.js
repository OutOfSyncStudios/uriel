// app/server.js

// Dependencies
const
  _                   = require('./lib/lodashExt')
  , LogStub           = require('./lib/logstub')
  , fs                = require('fs')
  , os                = require('os')
  , moment            = require('moment')
  , StatsD            = require('hot-shots')
;

let server = {};

/**
 * @class Server
 * @classdesc Server Class
 */
class Server {
  constructor(config, log) {
    const defaults = {
      server: {
        shutdownTime: 1000,
        pollingTimer: 5000
      },
      statsd: {
        host: '127.0.0.1',
        port: '8125',
        name: 'Uriel',
        attachHostName: false,
        telegraf: false
      }
    }
    let osHost = os.hostname();

    this.statsd = {};
    this.log = log || new LogStub();
    this.config = _.merge(defaults, (config || {}));
    this.hostname = config.statsd.name || osHost;

    if (this.config.statsd.attachHostName && this.hostname !== osHost) {
      this.hostname = this.hostname + '_' + osHost;
    }

    // Set the server base configuration
    this.isActive = false;
    this.monitors = {};
    this.timer = null;
  };

  // ****************************************************************************
  //  Server Shutdown Logic
  // ***************************************************************************/
  close() {
    // Perform gracful shutdown here
    this.isActive = false;

    if (_.hasValue(this.timer)) {
      this.log.debug(`Shutting down polling timer.`);
      clearInterval(this.timer);
    }

    if (_.hasValue(this.statsd)) {
      this.log.debug(`Closing UDP connection to statsd server.`);
      this.statsd.close()
      this.statsd = null;
    }
  }

  // ****************************************************************************
  // Server Initialization Logic
  // ***************************************************************************/
  init() {
    this.isActive = true;
    this.setupConnection();
    this.monitors = require('./monitors')(this.hostname, this.statsd, this.log);

    // call setInterval for polling
    this.log.info(`Running polling every ${this.config.server.pollingTimer}ms...`);
    this.timer = setInterval(this.runStats.bind(this), this.config.server.pollingTimer);
  }

  // ****************************************************************************
  // Setup UDP Connection
  // ***************************************************************************/
  setupConnection() {
    // connect to hot-shots to connect UDP server
    this.log.debug(`Making UDP connection to statsd server.`);
    this.statsd = new StatsD({
      host: this.config.statsd.host,
      post: this.config.statsd.post,
      telegraf: this.config.statsd.telegraf || false,
      errorHander: ((err) => {
        this.log.error(err);
      })
    });
  }

  // ****************************************************************************
  // Run Stats
  // ***************************************************************************/
  runStats() {
    this.log.debug('Running Information Polling');
    this.collectStats();
    this.sendStats();
  }

  // ****************************************************************************
  // Collect Stats
  // ***************************************************************************/
  collectStats() {
    for (let m in this.monitors) {
      let monitor;
      if (this.monitors.hasOwnProperty(m)) {
        monitor = this.monitors[m];

        this.log.debug(`Collecting statistics for (${monitor.name} monitor)...`);
        monitor.collect();
        this.log.debug(`Collected statistics for (${monitor.name} monitor)...`);
      }
    }
  }

  // ****************************************************************************
  // Send Stats
  // ***************************************************************************/
  sendStats() {
    for (let m in this.monitors) {
      let monitor = this.monitors[m];

      this.log.debug(`Sending statistics (${monitor.name} monitor)...`);
      monitor.send(this.isActive);
      this.log.debug(`Sent statistics (${monitor.name} monitor).`);

      monitor.clear();
    }
  }
}

module.exports = Server;
