// app/monitors/memory.js

let
  os          = require('os')
  , Monitor   = require('../lib/monitor')
;

class MemoryMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('mem', hostname, statsd, log);
  }

  collect() {
    const freemem = os.freemem();
    const totalmem = os.totalmem();

    this.setStats({
      'free': freemem,
      'free_percent': (freemem / totalmem) * 100,
      'total': totalmem,
      'used': (totalmem - freemem),
      'used_percent': ((totalmem - freemem) / totalmem) * 100
    });
  }
}

module.exports = MemoryMonitor;
