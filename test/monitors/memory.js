// test/monitors/memory.js

const __ = require('@mediaxpost/lodashext');
const chai = require('chai');
const expect = chai.expect;
const MemoryMonitor = require('../../app/monitors/memory');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('MemoryMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.memory = await new MemoryMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.memory).to.be.instanceof(MemoryMonitor);
    });

    it('collect', () => {
      monitorTest.memory.collect();
      const stats = monitorTest.memory.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
