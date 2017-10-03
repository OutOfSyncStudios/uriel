// app/monitors/swap.js

let
  si        = require('systeminformation')
  , Monitor   = require('../lib/monitor')
;

class SwapMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('swap', hostname, statsd, log);
  }

  collect() {
    si.mem()
    .then((data) => {
      this.setStats({
        'free': data.swapfree,
        'free_percent': (data.swapfree / data.swaptotal) * 100,
        'total': data.swaptotal,
        'used': data.swapused,
        'used_percent': (data.swapused / data.swaptotal) * 100
      });
    })
    .catch((err) => {
      this.log.error(err.stack || err)
    });
  }
}

module.exports = SwapMonitor;
