// app/lib/monitor.js
const __ = require('@mediaxpost/lodashext');

class Monitor {
  constructor(name, statsFactory) {
    this.name = name;
    this.statsFactory = statsFactory;
    this.statistics = [];
    this.log = this.statsFactory.log;
  }

  bundleStats(stats, tags) {
    tags = tags || [];
    return {
      value: stats,
      tags: tags
    };
  }

  setStats(objArr) {
    this.log.silly(`[${this.name}] Setting statistics`);
    if (!Array.isArray(objArr)) {
      objArr = [objArr];
    }
    this.statistics = [];
    for (let itr = 0, itrTest = objArr.length; itr < itrTest; itr++) {
      const obj = objArr[itr];
      const tempStats = __.toPairs(obj.value).map((pair) => {
        const name = this.name + '.' + pair[0];
        const val = pair[1];
        return this.statsFactory.create(name, val, obj.tags);
      });
      this.statistics = this.statistics.concat(tempStats);
    }
  }

  send(isActive) {
    // Only send if the server is still active and not shutting down
    if (isActive) {
      this.log.silly(`[${this.name}] Sending statistics`);
      this.statsFactory.send(this.statistics);
    }
  }

  sendPromise(isActive) {
    return new Promise((resolve) => {
      resolve(this.send(isActive));
    });
  }

  clear() {
    this.statistics = [];
  }

  clearPromise() {
    return new Promise((resolve) => {
      resolve(this.clear());
    });
  }

  collect() {
    // Do Nothing.. this is for override reasons
    return;
  }

  collectPromise() {
    return new Promise((resolve) => {
      resolve(this.collect());
    });
  }
}

module.exports = Monitor;
