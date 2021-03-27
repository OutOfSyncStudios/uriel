// test/libs/monitor.js

const isNil = require('lodash.isnil');
const chai = require('chai');
const expect = chai.expect;
const Monitor = require('../../app/lib/monitor');
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

/* eslint-disable require-atomic-updates */
module.exports = (config, libTest) => {
  describe('Monitor', () => {
    before(async() => {
      let factory = libTest.statsFactory;
      if (isNil(factory)) {
        const hostname = 'test';
        const statsd = null;
        const tags = [];
        const log = new LogStub();
        factory = new StatsFactory(hostname, statsd, tags, log);
      }
      const monitor = await new Monitor('test', factory);
      libTest.monitor = monitor;
    });

    it('constructor', () => {
      expect(libTest.monitor).to.be.instanceof(Monitor);
    });

    it('bundleStats', () => {
      const param1 = 'test1';
      const param2 = ['value1'];
      const val = libTest.monitor.bundleStats(param1, param2);
      expect(val).to.have.all.keys('value', 'tags');
      expect(val.value).to.be.equal(param1);
      expect(val.tags).to.have.lengthOf(1);
      expect(val.tags[0]).to.be.equal(param2[0]);
    });

    it('setStats', () => {
      const params = [
        libTest.monitor.bundleStats({
          lame: 1,
          test: 'test'
        })
      ];
      libTest.monitor.setStats(params);
      const stats = libTest.monitor.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
      expect(stats.length).to.be.equal(2);
    });

    it('clear', () => {
      libTest.monitor.clear();
      const stats = libTest.monitor.statistics;
      expect(Array.isArray(stats)).to.be.equal(true);
      expect(stats.length).to.be.equal(0);
    });

    it('collect', () => {
      expect(libTest.monitor.collect).to.be.a('function');
      const val = libTest.monitor.collect();
      expect(val).to.be.an('undefined');
    });
  });
};
