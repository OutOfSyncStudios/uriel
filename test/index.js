const test = require('unit.js');
const config = require('../config/config');

describe('uriel', () => {

  let Uriel = require('../');
  let statsd = new Uriel(config);

  it('load', () => {
    let myModule = require('../');
    let myClass = new myModule(config)

    test.assert(myClass instanceof Uriel);
  });

  it('startup', () => {
    statsd.init();
    test.assert(statsd.isActive);
  });

  it('shutdown', () => {
    statsd.close();
    test.assert(!statsd.isActive);
  });

});
