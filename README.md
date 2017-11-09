# uriel

[![NPM](https://nodei.co/npm/uriel.png?downloads=true)](https://nodei.co/npm/uriel/)

[![Actual version published on npm](http://img.shields.io/npm/v/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Travis build status](https://travis-ci.org/chronosis/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Total npm module downloads](http://img.shields.io/npm/dt/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Package Quality](http://npm.packagequality.com/shield/uriel.svg)](http://packagequality.com/#?package=uriel)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d264ea63a69a4e3899ce06d6e81f18fb)](https://www.codacy.com/app/chronosis/uriel?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=chronosis/uriel&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/d264ea63a69a4e3899ce06d6e81f18fb)](https://www.codacy.com/app/chronosis/uriel?utm_source=github.com&utm_medium=referral&utm_content=chronosis/uriel&utm_campaign=Badge_Coverage)


Uriel is a NodeJS StatsD agent that pushes system, memory, cpu, network, swap, diskio, and disk usage statistics to any compatible StatsD (e.g. StatsD, Telegraf, DogStatsD) listener over UDP.

It can be run either as standalone server, or it can be embedded within another application.

## Embedded Runner

### Installation

```
$ npm install uriel
```

### Usage
```js
  const Uriel = require('uriel');

  let statsd = new Uriel(config, logger);
  statsd.init();
```

### Configuration
The configuration parameter expects and object that contains the following (with defaults provided below):
```
{
  server: {
    shutdownTime: 1000,
    pollingTimer: 5000
  },
  statsd: {
    host: '127.0.0.1',
    port: '8125',
    name: 'Uriel',
    attachHostName: false,
    telegraf: false
  }
}
```

 * `server.pollingTime` -- the frequency of data pushes to the StatsD server.
 * `statsd.host` -- the server host where the StatsD server is running.
 * `statsd.port` -- the UDP port that the StatsD server is listening on.
 * `statsd.name` -- the `serverName` tag that is provided for all stats that are pushed. This allows info from differing servers to be distinguished from one another.
 * `statsd.attachHostName` -- `true` or `false` value that specifies that the os hostname should be appended to the `serverName`.
 * `statsd.telegraf` -- `true` or `false` value that specifies that the listening server is running telegraf.

### Logging
The logger parameter expects an object or class instance that supports the `log`, `debug`, `info`, and `error` methods. For example, an instance of [Winston](https://www.npmjs.com/package/winston) or [Bunyan](https://www.npmjs.com/package/bunyan).

### Startup
To start the statsd agent the `.init()` method should be used.

### Shutdown
To shutdown the statsd agent the `.close()` method should be used.

## Standalone Server

### Installation
```
$ git clone https://github.com/chronosis/uriel
$ cd uriel
```

### Configuration
The file `config/config.js` should be edited to reflect any changes you may have. The standalone server uses [Winston](https://www.npmjs.com/package/winston) for logging and logs to the `logs/` folder.  

Alternatively, the `-c` switch can be passed on the CLI to specify an external configuration file in either `.js` or `.json` format.

```
$ node app -c config/example-external-config.json
```

### Running
#### With NodeJS
From the Uriel folder, perform:
```
$ node app.js
```

#### With PM2
```
$ pm2 start app.js -n "Uriel" -i 1
```

#### With PM2 and an external configuration
```
$ pm2 start app.js -n "Uriel" -i 1 -- -c <fullpath to config file>
```

## StatsD Buckets
The following buckets are used to capture statistics:

### System
 * `system.uptime`
 * `system.load1`
 * `system.load5`
 * `system.load15`

### CPU
 * `cpu.usage_user`
 * `cpu.usage_nice`
 * `cpu.usage_system`
 * `cpu.usage_idle`
 * `cpu.usage_irq`
 * `cpu.usage_total`

For all CPUs

### Memory
 * `mem.free`
 * `mem.free_percent`
 * `mem.total`
 * `mem.used`
 * `mem.used_percent`

### Network
 * `network.close_wait`
 * `network.estab`
 * `network.establised`
 * `network.last_ack`
 * `network.listen`
 * `network.syn_sent`
 * `network.time_wait`

### Disk IO
 * `diskio.io_time`
 * `diskio.iops_in_progress`
 * `diskio.weighted_io_time`
 * `diskio.read_bytes`
 * `diskio.read_time`
 * `diskio.write_bytes`
 * `diskio.write_time`

### Disk Usage
 * `disk.free`
 * `disk.free_percent`
 * `disk.total`
 * `disk.used`
 * `disk.used_percent`

## Swap
 * `swap.free`
 * `swap.free_percent`
 * `swap.total`
 * `swap.used`
 * `swap.used_percent`

For all disks

## API

### constructor(config[, logger])
```
const Uriel = require(`uriel');

let statsd = new Uriel(config, logger);
```

Where the config parameter is the config object as outlined above, and the logger parameter is any compatible logging instance as outlined above. If no logger is provided, then all logging is sent to `/dev/null`

### .init()
Initializes and starts the Uriel statsD agent

### .close()
Shuts down the Uriel StatsD agent

## Why the name?
The name [Uriel](https://en.wikipedia.org/wiki/Uriel) is associated with Abrahamic religions for the Archangel which represents the light of the divine and as one who had dominion over another type of angel, the Gregori (i.e. The Watcher). The name was chosen both because of its association with illuminating dark places and watching things, as these concepts have overlap with systems monitoring.
