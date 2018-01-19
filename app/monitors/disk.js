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
        let allStatistics = {};
        let totalUsed = 0;
        let total = 0;

        for (let itr = 0, jtr = diskStatisticsList.length; itr < jtr; itr++) {
          const diskStatistics = diskStatisticsList[itr];
          if (__.hasValue(diskStatistics)) {
            totalUsed += diskStatistics.used;
            total += diskStatistics.size;
            // const name = diskStatistics.fs;
            delete diskStatistics.fs;
            // allStatistics[name] = diskStatistics;
          }
        }

        allStatistics = {
          free: total - totalUsed,
          free_percent: (total - totalUsed) / total * 100,
          total: total,
          used: totalUsed,
          used_percent: totalUsed / total * 100
        };

        this.setStats(allStatistics);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }
}

module.exports = DiskMonitor;
