// test/libs/logger.js

const chai = require('chai');
const expect = chai.expect;
const Logger = require('../../app/lib/logger');

chai.use(require('chai-match'));

module.exports = (config, libTest) => {
  describe('Logger Wrapper', () => {
    before(async() => {
      libTest.logger = await new Logger(config);
    });

    it('constructor', () => {
      expect(libTest.logger).to.be.instanceof(Logger);
    });

    it('log functions', () => {
      expect(libTest.logger.log.log).to.be.a('function');
    });

    it('formatter function', () => {
      const test1 = 'info';
      const test2 = 'This is a Test.';
      const val = libTest.logger.formatter({ level: test1, message: test2 });
      expect(val).to.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z \[(.*?)\]: (.*)$/)
        .and.capture(0).equals(test1.toUpperCase())
        .and.capture(1).equals(test2);
    });
  });
};
