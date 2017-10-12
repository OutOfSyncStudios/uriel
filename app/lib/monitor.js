// app/lib/monitor.js

let
  _               = require('./lodashExt')
  , Statistic     = require('./statistic')
;

class Monitor {
  constructor(name, hostname, statsd, log) {
    this.name = name;
    this.hostname = hostname;
    this.statsd = statsd;
    this.log = log;
    this.statistics = [];
  }

  setStats(obj, tags) {
    this.log.debug('Setting statistics (%s)...', this.name);

    this.statistics = _.toPairs(obj).map((pair) => {
      return new Statistic(`${this.name}.${pair[0]}`, pair[1], this.hostname, this.statsd, this.log, tags);
    });
  }

  send(isActive) {
    // Only send if the server is still active and not shutting down
    if (isActive) {
      this.log.debug('Sending statistics...');

      const statistics = this.statistics;
      for (let i = 0, j = statistics.length; i < j; i++) {
        let stat = statistics[i];
        stat.send();
      }
    }
  }

  clear() {
    this.statistics = [];
  }
}

module.exports = Monitor;
