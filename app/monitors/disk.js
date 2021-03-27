// app/monitors/disk.js

const isNil = require('lodash.isnil');
const si = require('systeminformation');
const Monitor = require('../lib/monitor');

class DiskMonitor extends Monitor {
  constructor(statsFactory) {
    super('disk', statsFactory);
  }

  collect() {
    si
      .fsSize()
      .then((diskStatisticsList) => {
        const allStats = [];
        let totalUsed = 0;
        let total = 0;
        let count = 0;

        for (let itr = 0, jtr = diskStatisticsList.length; itr < jtr; itr++) {
          const tags = [`disk:${itr}`];
          const diskStatistics = diskStatisticsList[itr];
          if (!isNil(diskStatistics)) {
            const size = diskStatistics.size;
            const used = diskStatistics.used;
            const free = size - used;
            totalUsed += used;
            total += size;
            count++;
            const diskStats = {
              free: free,
              free_percent: free / size * 100,
              total: total,
              used: used,
              used_percent: used / size * 100
            };
            allStats.push(this.bundleStats(diskStats, tags));
            delete diskStatistics.fs;
          }
        }

        const stats = {
          free: total - totalUsed,
          free_percent: (total - totalUsed) / total * 100,
          total: total,
          used: totalUsed,
          used_percent: totalUsed / total * 100,
          num_disks: count
        };
        allStats.push(this.bundleStats(stats, ['disk:total']));

        this.setStats(allStats);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }
}

module.exports = DiskMonitor;
