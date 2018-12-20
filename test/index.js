const chai = require('chai');
const expect = chai.expect;
const config = require('../config/config');

describe('uriel', () => {
  const Uriel = require('../');
  const statsd = new Uriel(config);

  it('load', () => {
    const MyModule = require('../');
    const myClass = new MyModule(config);

    expect(myClass).to.be.instanceof(Uriel);
  });

  it('startup', () => {
    statsd.init();
    expect(statsd.isActive).to.be.equal(true);
  });

  it('sleep', (done) => {
    setTimeout(done, 6000);
  }).timeout(10000);

  it('check that tags array has remained immutable', () => {
    expect(statsd.tags.length).to.be.equal(0);
  });

  it('shutdown', () => {
    statsd.close();
    expect(!statsd.isActive).to.be.equal(true);
  });
});
