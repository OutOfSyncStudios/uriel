// app/lib/logstub.js

// This class exists to stub out the logger when it is not included
class LogStub {
  constructor() {
  }

  log(...args) { return; }
  silly(...args) { return; }
  debug(...args) { return; }
  verbose(...args) { return; }
  info(...args) { return; }
  warn(...args) { return; }
  error(...args) { return; }
}

module.exports = LogStub;
