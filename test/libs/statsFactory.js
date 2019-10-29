// test/libs/statsFactory.js

const chai = require('chai');
const expect = chai.expect;
const StatsFactory = require('../../app/lib/statsFactory');
const LogStub = require('logstub');

const statsd = {
  count: 0,
  error: false,
  gauge: ((name, value, tags, callback) => {
    if (statsd.error) {
      callback(new Error('error'));
    } else {
      statsd.count++;
      callback();
    }
  })
};

module.exports = ((config, libTest) => {
  describe('StatsFactory', () => {
    before(async() => {
      const hostname = 'test';
      const tags = [];
      const log = new LogStub();
      libTest.statsFactory = await new StatsFactory(hostname, statsd, tags, log);
    });

    it('constructor', () => {
      expect(libTest.statsFactory).to.be.instanceof(StatsFactory);
    });

    it('create', () => {
      const param1 = 'testTest';
      const param2 = 'test2';
      const param3 = ['test3'];
      const val = libTest.statsFactory.create(param1, param2, param3);
      expect(val).to.have.all.keys('name', 'value', 'tags');
      expect(val.name).to.be.equal('test_test');
      expect(val.value).to.be.equal(param2);
      expect(Array.isArray(val.tags)).to.be.equal(true);
      expect(val.tags).to.have.lengthOf(1);
      expect(val.tags[0]).to.be.equal(param3[0]);
    });

    it('send (bad collection)', () => {
      const badfn = (() => { libTest.statsFactory.send('lame'); });
      expect(badfn).to.throw();
    });

    it('send (single object)', () => {
      const param1 = 'testTest';
      const param2 = 'test2';
      const param3 = ['test3'];
      const testObj = libTest.statsFactory.create(param1, param2, param3);
      libTest.statsFactory.send(testObj);
      expect(libTest.statsFactory.statsd.count).to.be.equal(1);
    });

    it('send (object array)', () => {
      const param1 = 'testTest';
      const param2 = 'test2';
      const param3 = ['test3'];
      const testObj = libTest.statsFactory.create(param1, param2, param3);
      const collection = [testObj, testObj];
      libTest.statsFactory.send(collection);
      expect(libTest.statsFactory.statsd.count).to.be.equal(3);
    });

    it('send (object array with a bad record)', () => {
      const param1 = 'testTest';
      const param2 = 'test2';
      const param3 = ['test3'];
      const testObj = libTest.statsFactory.create(param1, param2, param3);
      const collection = [testObj, 'badrec'];
      libTest.statsFactory.send(collection);
      expect(libTest.statsFactory.statsd.count).to.be.equal(4);
    });

    it('send (with sim statsd Error)', () => {
      libTest.statsFactory.statsd.error = true;
      const param1 = 'testTest';
      const param2 = 'test2';
      const param3 = ['test3'];
      const testObj = libTest.statsFactory.create(param1, param2, param3);
      libTest.statsFactory.send(testObj);
      expect(libTest.statsFactory.statsd.count).to.be.equal(4);
    });
  });
});
