const test = require('unit.js');

describe('logstub', () => {
  const LogStub = require('../app/lib/logstub');
  const logger = new LogStub();

  it('load', () => {
    const MyModule = require('../app/lib/logstub');
    const myClass = new MyModule();

    test.assert(myClass instanceof LogStub);
  });

  it('Log', () => {
    test.assert(logger.log() === undefined);
  });

  it('silly', () => {
    test.assert(logger.silly() === undefined);
  });

  it('debug', () => {
    test.assert(logger.debug() === undefined);
  });

  it('verbose', () => {
    test.assert(logger.verbose() === undefined);
  });

  it('info', () => {
    test.assert(logger.info() === undefined);
  });

  it('warn', () => {
    test.assert(logger.warn() === undefined);
  });

  it('error', () => {
    test.assert(logger.error() === undefined);
  });
});
