// app/monitors/network.js

let
  _                 = require('../lib/lodashExt')
  , os              = require('os')
  , childProcess    = require('child_process')
  , readline        = require('readline')

  , changeCase      = require('change-case')
  , netstat         = require('node-netstat')
  , Monitor         = require('../lib/monitor')
;

const isPlatformLinux = (process.platform === 'linux');
const command = {
    cmd: 'ss',
    args: ['-tan']
};

class NetworkMonitor extends Monitor {
  constructor(hostname, statsd, log) {
    super('network', hostname, statsd, log);

    this.connectionsStatesCountStatsd = {};
  }

  collect() {
    if (isPlatformLinux) {
        this.collectLinux();
    } else {
        this.collectOther();
    }
  }

  collectLinux() {
    this.getTcpStateCounts()
      .then((tcpStateCounts) => {
        this.setStats(tcpStateCounts);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }

  collectOther() {
    let connections = [];

    netstat({
      filter: {
        protocol: 'tcp'
      },
      done: () => {
          const fullConnectionsStatesCount = this.getStats(connections);
          this.setStats(fullConnectionsStatesCount);
        }
      },
      (connection) => connections.push(connection)
    );
  }

  getStats(connections) {
    let connectionsStatesCount = _.countBy(connections, 'state');

    for (let connectionState in connectionsStatesCount) {
      this.connectionsStatesCountStatsd[changeCase.snakeCase(connectionState)] = connectionsStatesCount[connectionState];
    }

    return this.connectionsStatesCountStatsd;
  }

  getTcpStateCounts() {
    return new Promise((resolve, reject) => {
      const proc = childProcess.spawn(command.cmd, command.args);

      proc.on('error', reject);

      const tcpStateCounts = {};

      const lineReader = readline.createInterface({
        input: proc.stdout
      });

      let isFirstLine = true;

      lineReader.on('line', line => {
        if (isFirstLine) {
          isFirstLine = false;
          return;
        }
        const firstSeparator = line.indexOf(' ');
        const status = line.substr(0, firstSeparator);
        const statusSnakeCase = changeCase.snakeCase(status);
        tcpStateCounts[statusSnakeCase] = (tcpStateCounts[statusSnakeCase] || 0) + 1;
      });

      proc.stdout.on('close', () => {
        resolve(tcpStateCounts);
      });
    });
  }
}

module.exports = NetworkMonitor;