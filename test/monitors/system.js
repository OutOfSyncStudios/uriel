// test/monitors/system.js

const chai = require('chai');
const expect = chai.expect;
const SystemMonitor = require('../../app/monitors/system');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('SystemMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.system = await new SystemMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.system).to.be.instanceof(SystemMonitor);
    });

    it('collect', () => {
      monitorTest.system.collect();
      const stats = monitorTest.system.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
