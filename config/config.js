module.exports = {
  'server': {
    'shutdownTime': 1000,
    'pollingTimer': 5000
  },
  'logging': { // Logging Configuration
    'logDir': './logs',
    'options': {
      'json': false,
      'maxsize': '10000000',
      'maxFiles': '10',
      'level': 'silly'
    }
  },
  'statsd': {
    'host': '127.0.0.1',
    'port': 8125,
    'name': 'Test',
    'telegraf': false
  },
}
