// app/monitors/network.js

const __ = require('../lib/lodashExt');
const childProcess = require('child_process');
const readline = require('readline');
const changeCase = require('change-case');
const netstat = require('node-netstat');
const Monitor = require('../lib/monitor');

const isPlatformLinux = (process.platform === 'linux');
const command = { cmd: 'ss', args: ['-tan'] };

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
    this
      .getTcpStateCounts()
      .then((tcpStateCounts) => {
        this.setStats(tcpStateCounts);
      })
      .catch((err) => {
        this.log.error(err.stack || err);
      });
  }

  collectOther() {
    const connections = [];

    netstat(
      {
        filter: { protocol: 'tcp' },
        done: () => {
          const fullConnectionsStatesCount = this.getStats(connections);
          this.setStats(fullConnectionsStatesCount);
        }
      },
      (connection) => {
        return connections.push(connection);
      }
    );
  }

  getStats(connections) {
    const connectionsStatesCount = __.countBy(connections, 'state');

    for (const connectionState in connectionsStatesCount) {
      if (connectionsStatesCount.hasOwnProperty(connectionState)) {
        const snakeStr = changeCase.snakeCase(connectionState);
        this.connectionsStatesCountStatsd[snakeStr] = connectionsStatesCount[connectionState];
      }
    }

    return this.connectionsStatesCountStatsd;
  }

  getTcpStateCounts() {
    return new Promise((resolve, reject) => {
      const proc = childProcess.spawn(command.cmd, command.args);

      proc.on('error', reject);

      const tcpStateCounts = {};

      const lineReader = readline.createInterface({ input: proc.stdout });

      let isFirstLine = true;

      lineReader.on('line', (line) => {
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
