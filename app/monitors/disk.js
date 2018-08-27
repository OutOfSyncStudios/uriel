// app/monitors/disk.js

const __ = require('@mediaxpost/lodashext');
const si = require('systeminformation');
const Monitor = require('../lib/monitor');

class DiskMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('disk', hostname, statsd, log);
  }

  collect() {
    si
      .fsSize()
      .then((diskStatisticsList) => {
        const stats = {};
        let totalUsed = 0;
        let total = 0;

        for (let itr = 0, jtr = diskStatisticsList.length; itr < jtr; itr++) {
          const key = `disk${itr}`;
          const diskStatistics = diskStatisticsList[itr];
          if (__.hasValue(diskStatistics)) {
            const size = diskStatistics.size;
            const used = diskStatistics.used;
            const free = size - used;
            totalUsed += used;
            total += size;
            stats[`${key}_free`] = free;
            stats[`${key}_free_percent`] = free / size * 100;
            stats[`${key}_total`] = total;
            stats[`${key}_used`] = used;
            stats[`${key}_used_percent`] = used / size * 100;
            delete diskStatistics.fs;
          }
        }

        stats.free = total - totalUsed;
        stats.free_percent = (total - totalUsed) / total * 100;
        stats.total = total;
        stats.used = totalUsed;
        stats.used_percent = totalUsed / total * 100;

        this.setStats(stats);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }
}

module.exports = DiskMonitor;
