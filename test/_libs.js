// test/_libs.js

// Dependancies
const config = require('../config/config');

const libTest = { logger: null, monitor: null, statsFactory: null };

describe('Library Tests', () => {
  before(() => {
    // Do all necessary things here
  });

  after(() => {
    // Do all necessary things here
  });

  // ========================================================================
  // Logger Wrapper
  // ========================================================================
  require('./libs/logger')(config, libTest);

  // ========================================================================
  // StatsFactory
  // ========================================================================
  require('./libs/statsFactory')(config, libTest);

  // ========================================================================
  // Monitor
  // ========================================================================
  require('./libs/monitor')(config, libTest);
});
