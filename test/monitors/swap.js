// test/monitors/swap.js

const chai = require('chai');
const expect = chai.expect;
const SwapMonitor = require('../../app/monitors/swap');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('SwapMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.swap = await new SwapMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.swap).to.be.instanceof(SwapMonitor);
    });

    it('collect', () => {
      monitorTest.swap.collect();
      const stats = monitorTest.swap.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
