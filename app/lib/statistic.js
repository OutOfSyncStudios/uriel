// app/lib/statistic.js

const __ = require('@mediaxpost/lodashext');
const changeCase = require('change-case');

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
    if (!tags) {
      this.tags = [];
    } else if (Array.isArray(tags)) {
      // Make a copy of the tags array (the original array should remain immutable)
      this.tags = Object.assign([], tags);
    } else {
      this.tags = [tags];
    }
    this.tags.push('serverName:' + this.hostname);
  }

  send() {
    // Only send if the statsd connection has not been shut down
    if (__.hasValue(this.statsd)) {
      // this.log.silly('Sending statistic %s = %d', this.statsdName, this.value);
      this.statsd.gauge(this.statsdName, this.value, this.tags, (error) => {
        if (error) {
          this.log.error(error.stack || error);
        } else {
          // this.log.silly('Success');
        }
      });
    }
  }
}

module.exports = Statistic;
