// app/monitors/diskio.js

let
  si        = require('systeminformation')
  , Monitor   = require('../lib/monitor')
;

class DiskIOMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('diskIO', hostname, statsd, log);
  }

  collect() {
    si.disksIO()
    .then((data) => {
      this.setStats({
        'io_time': data.ms,
        'iops_in_progress': data.tIO,
        'weighted_io_time': data.tIO_sec,
        'read_bytes': data.rIO,
        'read_time': data.rIO_sec,
        'write_bytes': data.wIO,
        'write_time': data.wIO_sec,
      });
    })
    .catch((err) => {
      this.log.error(err.stack || err)
    });
  }
}

module.exports = DiskIOMonitor;
