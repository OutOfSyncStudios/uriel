// app/monitors/network.js

const snakeCase = require('lodash.snakecase');
const si = require('systeminformation');
const Monitor = require('../lib/monitor');

class NetworkMonitor extends Monitor {
  constructor(statsFactory) {
    super('network', statsFactory);

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
          const snakeStr = snakeCase(data.state);
          if (Object.prototype.hasOwnProperty.call(connectionStates, snakeStr)) {
            connectionStates[snakeStr] += 1;
          } else {
            connectionStates[snakeStr] = 1;
          }
        }
        this.setStats(this.bundleStats(connectionStates));
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }
}

module.exports = NetworkMonitor;
