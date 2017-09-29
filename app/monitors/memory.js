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
      'total': totalmem,
      'used': (totalmem - freemem),
    });
  }
}

module.exports = MemoryMonitor;
