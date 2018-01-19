// app/lib/statistic.js

const __ = require('@mediaxpost/lodashext'), changeCase = require('change-case');

class Statistic {
  constructor(statsdName, value, hostname, statsd, log, tags) {
    this.log = log;
    this.statsd = statsd;
    this.statsdName = statsdName.split('.')
      .map((str) => {
        return changeCase.snakeCase(str);
      })
      .join('.');
    this.value = value;
    this.hostname = hostname || 'localhost';
    this.tags = tags || [];
    if (!Array.isArray(this.tags)) {
      this.tags = [this.tags];
    }

    this.tags.push(`serverName:${hostname}`);
  }

  send() {
    // Only send if the statsd connection has not been shut down
    if (__.hasValue(this.statsd)) {
      this.log.debug('Sending statistic %s = %d', this.statsdName, this.value);
      this.statsd.gauge(this.statsdName, this.value, this.tags, (error) => {
        if (error) {
          this.log.error(error.stack || error);
        } else {
          this.log.debug('Success');
        }
      });
    }
  }
}

module.exports = Statistic;
