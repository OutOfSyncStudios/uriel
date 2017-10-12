// app/monitors/cpu.js

let
  os          = require('os')
  , Monitor   = require('../lib/monitor')
;

class CpuMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('cpu', hostname, statsd, log);
  }

  collect() {
    let intervalCpuTimes = this.getIntervalCpuTimes();

    if (intervalCpuTimes == null) { return; }

    let totalIntervalCpuTime = intervalCpuTimes.user + intervalCpuTimes.nice + intervalCpuTimes.sys + intervalCpuTimes.idle + intervalCpuTimes.irq;

    this.setStats({
      'usage_user': ((intervalCpuTimes.user / totalIntervalCpuTime) * 100).toFixed(2),
      'usage_nice': ((intervalCpuTimes.nice / totalIntervalCpuTime) * 100).toFixed(2),
      'usage_sys': ((intervalCpuTimes.sys / totalIntervalCpuTime) * 100).toFixed(2),
      'usage_idle': ((intervalCpuTimes.idle / totalIntervalCpuTime) * 100).toFixed(2),
      'usage_irq': ((intervalCpuTimes.irq / totalIntervalCpuTime) * 100).toFixed(2),
      'usage_total': 100 - (((intervalCpuTimes.idle / totalIntervalCpuTime) * 100).toFixed(2)
    });
  }

  getIntervalCpuTimes() {
    let newCpuTimes = this.getCpuTimes();

    if (this.currentCpuTimes == null) {
      this.currentCpuTimes = newCpuTimes;
      return null;
    }

    let intervalCpuTimes = {
      user: newCpuTimes.user - this.currentCpuTimes.user,
      nice: newCpuTimes.nice - this.currentCpuTimes.nice,
      sys: newCpuTimes.sys - this.currentCpuTimes.sys,
      idle: newCpuTimes.idle - this.currentCpuTimes.idle,
      irq: newCpuTimes.irq - this.currentCpuTimes.irq
    };

    this.currentCpuTimes = newCpuTimes;

    return intervalCpuTimes;
  }

  getCpuTimes() {
    let cpus = os.cpus();

    let newCpuTimes = {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    };

    for (let i = 0, j = cpus.length; i < j; i++) {
      let cpu = cpus[i];

      newCpuTimes.user += cpu.times.user;
      newCpuTimes.nice += cpu.times.nice;
      newCpuTimes.sys += cpu.times.sys;
      newCpuTimes.idle += cpu.times.idle;
      newCpuTimes.irq += cpu.times.irq;
    }

    return newCpuTimes;
  }
}

module.exports = CpuMonitor;
