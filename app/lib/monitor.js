// app/lib/monitor.js

const __ = require('@mediaxpost/lodashext'), Statistic = require('./statistic');

class Monitor {
  constructor(name, hostname, statsd, log, tags) {
    this.name = name;
    this.hostname = hostname;
    this.statsd = statsd;
    this.log = log;
    this.statistics = [];
    this.tags = [];
    if (Array.isArray(tags)) {
      this.tags = tags;
    }
  }

  setStats(obj, tags) {
    this.log.silly(`[${this.name}] Setting statistics`);
    if (Array.isArray(tags)) {
      tags = [...this.tags, ...tags];
    } else {
      tags = this.tags;
    }
    this.statistics = __.toPairs(obj).map((pair) => {
      return new Statistic(`${this.name}.${pair[0]}`, pair[1], this.hostname, this.statsd, this.log, tags);
    });
  }

  send(isActive) {
    // Only send if the server is still active and not shutting down
    if (isActive) {
      this.log.silly(`[${this.name}] Sending statistics`);

      const statistics = this.statistics;
      for (let itr = 0, jtr = statistics.length; itr < jtr; itr++) {
        const stat = statistics[itr];
        stat.send();
      }
    }
  }

  clear() {
    this.statistics = [];
  }
}

module.exports = Monitor;
