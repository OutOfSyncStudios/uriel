// app/monitors/network.js

const si = require('systeminformation');
const changeCase = require('change-case');
const Monitor = require('../lib/monitor');

class NetworkMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('network', hostname, statsd, log);

    this.connectionsStatesCountStatsd = {};
  }

  collect() {
    const connectionStates = {
      foreign: 0,
      established: 0,
      listen: 0,
      syn_sent: 0,
      time_wait: 0,
      close_wait: 0,
      last_ack: 0
    };

    si
      .networkConnections()
      .then((connections) => {
        for (const data of connections) {
          const snakeStr = changeCase.snakeCase(data.state);
          if (connectionStates.hasOwnProperty(snakeStr)) {
            connectionStates[snakeStr] += 1;
          } else {
            connectionStates[snakeStr] = 1;
          }
        }
        this.setStats(connectionStates);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }
}

module.exports = NetworkMonitor;
