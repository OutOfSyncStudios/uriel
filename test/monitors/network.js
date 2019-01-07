// test/monitors/network.js

const __ = require('@mediaxpost/lodashext');
const chai = require('chai');
const expect = chai.expect;
const NetworkMonitor = require('../../app/monitors/network');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

module.exports = (config, monitorTest) => {
  describe('NetworkMonitor', () => {
    before(async() => {
      const hostname = 'test';
      const statsd = null;
      const tags = [];
      const log = new LogStub();
      const factory = new StatsFactory(hostname, statsd, tags, log);
      monitorTest.network = await new NetworkMonitor(factory);
    });

    it('constructor', () => {
      expect(monitorTest.network).to.be.instanceof(NetworkMonitor);
    });

    it('collect', () => {
      monitorTest.network.collect();
      const stats = monitorTest.network.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
    });
  });
};
