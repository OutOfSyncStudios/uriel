// app/server.js

// Dependencies
const __ = require('@mediaxpost/lodashext');
const LogStub = require('logstub');
const os = require('os');
const StatsD = require('hot-shots');
const StatsFactory = require('./lib/statsFactory');

// const server = {};

/**
 * @class Server
 * @classdesc Server Class
 */
class Server {
  constructor(config, log) {
    const defaults = {
      server: { shutdownTime: 1000, pollingTimer: 5000 },
      statsd: { host: '127.0.0.1', port: '8125', name: 'Uriel', attachHostName: false, telegraf: false, tags: [] }
    };
    const osHost = os.hostname();

    this.statsd = {};
    this.log = log || new LogStub();
    this.config = __.merge(defaults, config || {});
    this.hostname = config.statsd.name || osHost;
    this.tags = [];
    if (Array.isArray(config.statsd.tags)) {
      this.tags = Object.assign([], config.statsd.tags);
    }

    if (this.config.statsd.attachHostName && this.hostname !== osHost) {
      this.hostname = `${this.hostname}_${osHost}`;
    }

    this.log.debug(`Using ${this.hostname} to connect to ${this.config.statsd.host}:${this.config.statsd.port}...`);

    // Set the server base configuration
    this.isActive = false;
    this.monitors = {};
    this.timer = null;
    this.statsFactory = {};
  }

  // ****************************************************************************
  //  Server Shutdown Logic
  // ***************************************************************************/
  close() {
    // Perform gracful shutdown here
    this.isActive = false;

    if (__.hasValue(this.timer)) {
      this.log.debug('Shutting down polling timer.');
      clearInterval(this.timer);
    }

    if (__.hasValue(this.statsd)) {
      this.log.debug('Closing UDP connection to statsd server.');
      this.statsd.close();
      this.statsd = null;
    }
  }

  // ****************************************************************************
  // Server Initialization Logic
  // ***************************************************************************/
  init() {
    this.isActive = true;
    this.setupConnection();
    this.monitors = require('./monitors')(this.statsFactory);

    // call setInterval for polling
    this.log.info(`Running polling every ${this.config.server.pollingTimer}ms...`);
    this.timer = setInterval(this.runStats.bind(this), this.config.server.pollingTimer);
  }

  // ****************************************************************************
  // Setup UDP Connection
  // ***************************************************************************/
  setupConnection() {
    // connect to hot-shots to connect UDP server
    this.log.debug('Making UDP connection to statsd server.');
    this.statsd = new StatsD({
      host: this.config.statsd.host,
      post: this.config.statsd.post,
      telegraf: this.config.statsd.telegraf || false,
      errorHander: (err) => {
        this.log.error(err);
      }
    });
    this.statsFactory = new StatsFactory(this.hostname, this.statsd, this.tags, this.log);
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
    const monitors = this.monitors;
    for (const mon in monitors) {
      if (monitors.hasOwnProperty(mon)) {
        const monitor = this.monitors[mon];
        const str = ' statistics for (' + monitor.name + ' monitor)...';
        this.log.debug('Collecting' + str);
        monitor.collect();
        this.log.debug('Collected' + str);
      }
    }
  }

  // ****************************************************************************
  // Send Stats
  // ***************************************************************************/
  sendStats() {
    const monitors = this.monitors;
    for (const mon in monitors) {
      if (monitors.hasOwnProperty(mon)) {
        const monitor = this.monitors[mon];
        const str = ' statistics for (' + monitor.name + ' monitor)';
        const postStr = ' to ' + this.config.statsd.host + ' as ' + this.hostname;
        this.log.debug('Sending' + str + '...');
        monitor.send(this.isActive);
        this.log.debug('Sent' + str + postStr);
        monitor.clear();
      }
    }
  }
}

module.exports = Server;
