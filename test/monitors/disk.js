// test/monitors/disk.js

const __ = require('@mediaxpost/lodashext');
const chai = require('chai');
const expect = chai.expect;
const DiskMonitor = require('../../app/monitors/disk');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('DiskMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.disk = await new DiskMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.disk).to.be.instanceof(DiskMonitor);
    });

    it('collect', () => {
      monitorTest.disk.collect();
      const stats = monitorTest.disk.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
