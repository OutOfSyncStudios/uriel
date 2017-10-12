// app/monitors/disk.js

let
  _             = require('../lib/lodashExt')
  , os          = require('os')
  , si          = require('systeminformation')
  , Monitor     = require('../lib/monitor')
;


class DiskMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('disk', hostname, statsd, log);
  }

  collect() {
    si.fsSize()
    .then((diskStatisticsList) => {
      let allStatistics = {};
      let totalUsed = 0;
      let total = 0;

      for (let i = 0, j = diskStatisticsList.length; i < j; i++) {
        let diskStatistics = diskStatisticsList[i];
        if(_.hasValue(diskStatistics)) {
          totalUsed += diskStatistics.used;
          total += diskStatistics.size;
          let name = diskStatistics.fs;
          delete diskStatistics.fs;
          //allStatistics[name] = diskStatistics;
        }
      }

      allStatistics = {
        'free': (total - totalUsed),
        'free_percent': ((total - totalUsed) / total) * 100,
        'total': total,
        'used': totalUsed,
        'used_percent': (totalUsed / total) * 100
      }

      this.setStats(allStatistics);
    })
    .catch((err) => {
      this.log.error(err.stack || err);
    })
  }
}

module.exports = DiskMonitor;
