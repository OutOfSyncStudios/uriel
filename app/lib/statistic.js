// app/lib/statistic.js

let
  _                   = require('./lodashExt')
  , changeCase        = require('change-case')
;

class Statistic {
  constructor(statsdName, value, hostname, statsd, log) {
    this.log = log;
    this.statsd = statsd;
    this.statsdName = statsdName.split('.').map(s => changeCase.snakeCase(s)).join('.');
    this.value = value;
    this.hostname = hostname
  }

  send() {
    let hostname = this.hostname || 'localhost';
    // Only send if the statsd connection has not been shut down
    if (_.hasValue(this.statsd)) {
      this.log.debug('Sending statistic %s = %d', this.statsdName, this.value);
      this.statsd.gauge(this.statsdName, this.value, [ `serverName:${hostname}` ], (error, bytes) => {
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
