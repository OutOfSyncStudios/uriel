// app/monitors/disk.js

let
  _             = require('../lib/lodashExt')
  , os          = require('os')
  , bluebird    = require('bluebird')
  , drivelist   = bluebird.promisifyAll(require('drivelist'))
  , diskusage   = bluebird.promisifyAll(require('diskusage'))
  , Monitor     = require('../lib/monitor')
;


class DiskMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('disk', hostname, statsd, log);
  }

  collect() {
    drivelist.listAsync()
      .map((device) => {
        let deviceMountPath = device.mountpoints && device.mountpoints[0] && device.mountpoints[0].path;

        if (deviceMountPath == null) { return; }

        return diskusage.checkAsync(deviceMountPath)
          .then((deviceInfo) => {
            const deviceMountPathStatsdName = deviceMountPath.replace(':', '');
            return {
              'name': deviceMountPathStatsdName,
              'free': deviceInfo.free,
              'total': deviceInfo.total,
              'used': (deviceInfo.total - deviceInfo.free)
            };
          })
          .catch(err => {
            this.log.error(err.stack || err);
            return {};
          });
      })
      .then((diskStatisticsList) => {
        let allStatistics = {};
        let totalFree = 0;
        let total = 0;

        for (let i = 0, j = diskStatisticsList.length; i < j; i++) {
          let diskStatistics = diskStatisticsList[i];
          if(_.hasValue(diskStatistics)) {
            totalFree += diskStatistics.free;
            total += diskStatistics.total;
            let name = diskStatistics.name;
            delete diskStatistics.name;
            allStatistics[name] = diskStatistics;
          }
        }

        allStatistics.total = {
          'free': totalFree,
          'total': total,
          'used': (total - totalFree)
        }

        this.setStats(allStatistics);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      })
  }
}

module.exports = DiskMonitor;
