// app/monitors/system.js

const os = require('os');
const Monitor = require('../lib/monitor');

class SystemMonitor extends Monitor {
  constructor(statsFactory) {
    super('system', statsFactory);
  }

  collect() {
    const load = os.loadavg() || [0, 0, 0];
    const uptime = os.uptime() || 0;

    this.setStats(this.bundleStats({
      load1: load[0],
      load5: load[1],
      load15:
      load[2],
      uptime: uptime
    }));
  }
}

module.exports = SystemMonitor;
