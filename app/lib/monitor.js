// app/lib/monitor.js
const __ = require('@mediaxpost/lodashext');
const Statistic = require('./statistic');

class Monitor {
  constructor(name, statsFactory) {
    this.name = name;
    this.statsFactory = statsFactory;
    this.statistics = [];
    this.log = this.statsFactory.log;
  }

  setStats(obj) {
    this.log.silly(`[${this.name}] Setting statistics`);
    this.statistics = __.toPairs(obj).map((pair) => {
      let name = this.name + '.' + pair[0];
      return this.statsFactory.create(name, pair[1]);
    });
  }

  send(isActive) {
    // Only send if the server is still active and not shutting down
    if (isActive) {
      this.log.silly(`[${this.name}] Sending statistics`);
      this.statsFactory.send(this.statistics);
    }
  }

  clear() {
    this.statistics = [];
  }
}

module.exports = Monitor;
