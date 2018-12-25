// app/lib/statsFactory.js
const __ = require('@mediaxpost/lodashext');

class StatsFactory {
  constructor(hostname, statsd, tags, log) {
    this.hostname = hostname || 'localhost';
    this.statsd = statsd;
    this.log = log;
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

  create(name, value) {
    name = name.split('.')
      .map((str) => {
        return __.snakeCase(str);
      })
      .join('.');

    return {
      name: name,
      value: value
    };
  }

  send(collection, addedTags) {
    if (!Array.isArray(collection)) {
      if (typeof collection !== 'object') {
        throw new Error('Can not send a value')
      } else {
        collection = [collection];
      }
    }

    const tempTags = Object.assign([], this.tags);
    if (Array.isArray(addedTags)) {
      tempTags = [...tags, ...addedTags];
    }

    // Only send if the statsd connection has not been shut down
    if (__.hasValue(this.statsd)) {
      for (let itr = 0, jtr = collection.length; itr < jtr; itr++) {
        let stat = collection[itr]
        this.log.silly('Sending statistic %s = %d', stat.name, stat.value);

        if (typeof stat !== 'object' || !stat.hasOwnProperty('name') || !stat.hasOwnProperty('value')) {
          continue;
        }

        this.statsd.gauge(stat.name, stat.value, tempTags, (error) => {
          if (error) {
            this.log.error(error.stack || error);
          } else {
            this.log.silly('Success');
          }
        });
      }
    }
  }
}

module.exports = StatsFactory;
