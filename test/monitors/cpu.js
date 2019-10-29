// test/monitors/cpu.js

const chai = require('chai');
const expect = chai.expect;
const CpuMonitor = require('../../app/monitors/cpu');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('CpuMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.cpu = await new CpuMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.cpu).to.be.instanceof(CpuMonitor);
    });

    it('getCpuTimes', () => {
      const val = monitorTest.cpu.getCpuTimes();
      expect(val).to.be.a('object');
      expect(val).to.have.all.keys('cpus', 'user', 'nice', 'sys', 'idle', 'irq');
      expect(Array.isArray(val.cpus)).to.be.equal(true);
      expect(val.user).to.be.a('number');
      expect(val.nice).to.be.a('number');
      expect(val.sys).to.be.a('number');
      expect(val.idle).to.be.a('number');
      expect(val.irq).to.be.a('number');
    });

    it('getIntervalCpuTimes', () => {
      expect(monitorTest.cpu.currentCpuTimes).to.be.an('undefined');
      let val = monitorTest.cpu.getIntervalCpuTimes();
      expect(val).to.be.equal(null);
      val = monitorTest.cpu.getIntervalCpuTimes();
      expect(val).to.have.all.keys('cpus', 'user', 'nice', 'sys', 'idle', 'irq');
      expect(Array.isArray(val.cpus)).to.be.equal(true);
      expect(val.user).to.be.a('number');
      expect(val.nice).to.be.a('number');
      expect(val.sys).to.be.a('number');
      expect(val.idle).to.be.a('number');
      expect(val.irq).to.be.a('number');
      const val2 = monitorTest.cpu.getIntervalCpuTimes();
      expect(val2).to.be.a('object');
      expect(val2).to.have.all.keys('cpus', 'user', 'nice', 'sys', 'idle', 'irq');
      expect(Array.isArray(val2.cpus)).to.be.equal(true);
      expect(val2.user).to.be.a('number');
      expect(val2.nice).to.be.a('number');
      expect(val2.sys).to.be.a('number');
      expect(val2.idle).to.be.a('number');
      expect(val2.irq).to.be.a('number');
      // if (val.user === 0) val.user = -1;
      // if (val.nice === 0) val.nice = -1;
      // if (val.sys === 0) val.sys = -1;
      // if (val.idle === 0) val.idle = -1;
      // if (val.irq === 0) val.irq = -1;
      // expect(val.user).to.not.be.equal(val2.user);
      // expect(val.nice).to.not.be.equal(val2.nice);
      // expect(val.sys).to.not.be.equal(val2.sys);
      // expect(val.idle).to.not.be.equal(val2.idle);
      // expect(val.irq).to.not.be.equal(val2.irq);
    });

    it('collect', () => {
      monitorTest.cpu.collect();
      const stats = monitorTest.cpu.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
