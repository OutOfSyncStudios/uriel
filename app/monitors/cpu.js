// app/monitors/cpu.js

const os = require('os');
const Monitor = require('../lib/monitor');
const __ = require('@outofsync/lodash-ex');

class CpuMonitor extends Monitor {
  constructor(statsFactory) {
    super('cpu', statsFactory);
  }

  collect() {
    const allStats = [];
    const intervalCpuTimes = this.getIntervalCpuTimes();

    if (intervalCpuTimes === null) {
      return;
    }

    const totalIntervalCpuTime = intervalCpuTimes.user +
      intervalCpuTimes.nice +
      intervalCpuTimes.sys +
      intervalCpuTimes.idle +
      intervalCpuTimes.irq;

    const stats = {
      usage_user: (intervalCpuTimes.user / totalIntervalCpuTime * 100).toFixed(2),
      usage_nice: (intervalCpuTimes.nice / totalIntervalCpuTime * 100).toFixed(2),
      usage_sys: (intervalCpuTimes.sys / totalIntervalCpuTime * 100).toFixed(2),
      usage_idle: (intervalCpuTimes.idle / totalIntervalCpuTime * 100).toFixed(2),
      usage_irq: (intervalCpuTimes.irq / totalIntervalCpuTime * 100).toFixed(2),
      usage_total: 100 - (intervalCpuTimes.idle / totalIntervalCpuTime * 100).toFixed(2),
      num_cpus: intervalCpuTimes.cpus.length
    };

    allStats.push(this.bundleStats(stats, ['cpu:total']));

    for (let itr = 0, jtr = intervalCpuTimes.cpus.length; itr < jtr; itr++) {
      const cpu = intervalCpuTimes.cpus[itr];
      const tags = [`cpu:${itr}`];
      const totalIndividualCpuTime = cpu.user +
        cpu.nice +
        cpu.sys +
        cpu.idle +
        cpu.irq;

      const cpuStats = {
        usage_user: (cpu.user / totalIndividualCpuTime * 100).toFixed(2),
        usage_nice: (cpu.nice / totalIndividualCpuTime * 100).toFixed(2),
        usage_sys: (cpu.sys / totalIndividualCpuTime * 100).toFixed(2),
        usage_idle: (cpu.idle / totalIndividualCpuTime * 100).toFixed(2),
        usage_irq: (cpu.irq / totalIndividualCpuTime * 100).toFixed(2),
        usage_total: 100 - (cpu.idle / totalIndividualCpuTime * 100).toFixed(2)
      };
      allStats.push(this.bundleStats(cpuStats, tags));
    }
    this.setStats(allStats);
  }

  getIntervalCpuTimes() {
    const newCpuTimes = this.getCpuTimes();

    if (__.isUnset(this.currentCpuTimes)) {
      this.currentCpuTimes = newCpuTimes;
      return null;
    }
    const intervalCpuTimes = {
      user: newCpuTimes.user - this.currentCpuTimes.user,
      nice: newCpuTimes.nice - this.currentCpuTimes.nice,
      sys: newCpuTimes.sys - this.currentCpuTimes.sys,
      idle: newCpuTimes.idle - this.currentCpuTimes.idle,
      irq: newCpuTimes.irq - this.currentCpuTimes.irq,
      cpus: []
    };

    for (let itr = 0, jtr = newCpuTimes.cpus.length; itr < jtr; itr++) {
      intervalCpuTimes.cpus.push({
        user: newCpuTimes.cpus[itr].user - this.currentCpuTimes.cpus[itr].user,
        nice: newCpuTimes.cpus[itr].nice - this.currentCpuTimes.cpus[itr].nice,
        sys: newCpuTimes.cpus[itr].sys - this.currentCpuTimes.cpus[itr].sys,
        idle: newCpuTimes.cpus[itr].idle - this.currentCpuTimes.cpus[itr].idle,
        irq: newCpuTimes.cpus[itr].irq = this.currentCpuTimes.cpus[itr].irq
      });
    }

    // Save the current into the old
    this.currentCpuTimes = newCpuTimes;
    return intervalCpuTimes;
  }

  getCpuTimes() {
    const cpus = os.cpus();

    const newCpuTimes = { user: 0, nice: 0, sys: 0, idle: 0, irq: 0, cpus: [] };

    for (let itr = 0, jtr = cpus.length; itr < jtr; itr++) {
      const cpu = cpus[itr];
      newCpuTimes.cpus.push(cpu.times);
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
