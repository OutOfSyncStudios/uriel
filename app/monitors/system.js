// app/monitors/system.js

const os = require('os');
const Monitor = require('../lib/monitor');

class SystemMonitor extends Monitor {
  constructor(hostname, statsd, log, tags) {
    super('system', hostname, statsd, log, tags);
  }

  collect() {
    const load = os.loadavg() || [0, 0, 0];
    const uptime = os.uptime() || 0;

    this.setStats({ load1: load[0], load5: load[1], load15: load[2], uptime: uptime });
  }
}

module.exports = SystemMonitor;
