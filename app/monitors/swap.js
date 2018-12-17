// app/monitors/swap.js

const si = require('systeminformation');
const Monitor = require('../lib/monitor');

class SwapMonitor extends Monitor {
  constructor(hostname, statsd, log, tags) {
    super('swap', hostname, statsd, log, tags);
  }

  collect() {
    si
      .mem()
      .then((data) => {
        const total = data.swaptotal;
        this.setStats({
          free: data.swapfree,
          free_percent: total === 0 ? 0 : data.swapfree / total * 100,
          total: total,
          used: data.swapused,
          used_percent: total === 0 ? 0 : data.swapused / total * 100
        });
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }
}

module.exports = SwapMonitor;
