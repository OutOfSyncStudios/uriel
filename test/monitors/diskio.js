// test/monitors/cpu.js

const chai = require('chai');
const expect = chai.expect;
const DiskIOMonitor = require('../../app/monitors/diskio');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('DiskIOMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.diskio = await new DiskIOMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.diskio).to.be.instanceof(DiskIOMonitor);
    });

    it('collect', () => {
      monitorTest.diskio.collect();
      const stats = monitorTest.diskio.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
