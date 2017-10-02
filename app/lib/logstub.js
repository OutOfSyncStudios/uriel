// app/lib/logstub.js

// This class exists to stub out the logger when it is not included
class LogStub {
  constructor() {
  }

  log(...) { return; }
  silly(...) { return; }
  debug(...) { return; }
  verbose(...) { return; }
  info(...) { return; }
  warn(...) { return; }
  error(...) { return; }
}

module.exports = LogStub;
