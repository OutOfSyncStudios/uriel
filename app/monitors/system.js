// app/monitors/system.js

let
  os          = require('os')
  , Monitor   = require('../lib/monitor')
;

class SystemMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('system', hostname, statsd, log);
  }

  collect() {
    let load = os.loadavg() || [0,0,0];
    let uptime = os.uptime() || 0;

    this.setStats({
      'load1': load[0],
      'load5': load[1],
      'load15': load[2],
      'uptime': uptime
    });
  }
}

module.exports = SystemMonitor;
