# Uriel

[![NPM](https://nodei.co/npm/uriel.png?downloads=true)](https://nodei.co/npm/uriel/)

[![Actual version published on npm](http://img.shields.io/npm/v/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Travis build status](https://travis-ci.org/MediaXPost/uriel.svg)](https://travis-ci.org/MediaXPost/uriel)
[![Total npm module downloads](http://img.shields.io/npm/dt/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Package Quality](http://npm.packagequality.com/shield/uriel.svg)](http://packagequality.com/#?package=uriel)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d264ea63a69a4e3899ce06d6e81f18fb)](https://www.codacy.com/app/chronosis/uriel?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=MediaXPost/uriel&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/d264ea63a69a4e3899ce06d6e81f18fb)](https://www.codacy.com/app/chronosis/uriel?utm_source=github.com&utm_medium=referral&utm_content=MediaXPost/uriel&utm_campaign=Badge_Coverage)
[![Dependencies badge](https://david-dm.org/MediaXPost/uriel/status.svg)](https://david-dm.org/MediaXPost/uriel?view=list)

A simple service that pushes system information (e.g. system usage, memory, cpu, network, swap, diskio, and disk usage) to any compatible statsd service (e.g. StatsD, Telegraf, DogStatsD, etc.)

# Table of Contents

  1. [Documentation](#documentation)
      1. [Modes of Operation](#uriel-modes)
          1. [Stand-alone Service](#standalone)
              1. [Installation](#standalone-installation)
              2. [Configuration](#standalone-configuration)
              3. [Running](#standalone-running)
          2. [Embedded Service](#embedded)
              1. [Installation](#embedded-installation)
              2. [Usage](#embedded-usage)
              3. [API](#embedded-api)
      2. [Configuration Object](#uriel-configuration)
      3. [Logging Object](#uriel-logging)
      4. [Statsd Buckets](#statsd-buckets)
  2. [License](#license)

# Goals
**`Uriel`** is designed to be a lightweight NodeJS agent that gathers system information and delivers it to a compatible statsd service over UDP. It can be embedded within another service, or setup and configured as its own stand-alone service that runs on the system being monitored. At the time of creation, other NodeJS systeminfo agents were unsuitable due to their inflexibility or poor implementations. Uriel was created to (ideally) bridge those shortcomings. It uses UDP, because of the decreased network overhead that is required in comparison to TCP.

The name [Uriel](https://en.wikipedia.org/wiki/Uriel) is associated with Abrahamic religions for the Archangel which represents the light of the divine and as one who had dominion over another type of angel, the Gregori (i.e. The Watchers). The name was chosen both because of its association with illuminating dark places and watching things -- concepts related to system monitoring.

# [Documentation](#documentation)
<a name="documentataion"></a>

## [Modes of Operation](#relay-modes)
<a name="relay-modes"></a>

The Uriel service has two modes of operation:
  * [Stand-alone Service](#standalone)
  * [Embedded Service](#embedded)

### [Stand-alone Service](#standalone)
<a name="standalone"></a>

The stand-alone service option is available when it is desirable to use new/existing server architecture and more control over the environment is required.

#### [Installation](#standalone-installation)
<a name="standalone-installation"></a>

To install, clone the git repository:


```
$ git clone https://github.com/MediaXPost/uriel.git
$ cd uriel
```

#### [Configuration](#standalone-configuration)
<a name="standalone-configuration"></a>

To configure, run:
```shell
npm run config
```
This will ask a series of questions which provides the base configuration. Alternatively, it is possible to manually edit the `<uriel-base>/config/config.js` file to make adjustments. The configuration file is an exported version of the [Configuration Object](#relay-configuration).

#### [Running](#standalone-running)
<a name="standalone-running"></a>

Before running, ensure that a compatible statsd service is configured to listen for events on the configured port and the any firewall rules are open between the service and the statsd service. All operations below should be performed from the Uriel base folder.

**Note:** When using stand-alone mode, it is recommended that a process manager, such as [PM2](https://www.npmjs.com/package/pm2), be used. Regardless of how the service is run, proper startup scripts will be needed to ensure that Uriel restarts whenever the server is rebooted.

##### With NodeJS
```shell
$ node app.js
```

##### With NodeJS and an external configuration
It is possible to pass an external configuration file.

```shell
$ node app.js -c <fullpath to config file>
```

##### With PM2
```shell
$ pm2 start app.js -n "Uriel" -i 1
```

##### With PM2 and an external configuration
```shell
$ pm2 start app.js -n "Uriel" -i 1 -- -c <fullpath to config file>
```

### [Embedded Service](#embedded)
<a name="embedded"></a>

The embedded option is available if including the service bundled as a part of another service is desired.

#### [Installation](#embedded-installation)
<a name="embedded-installation"></a>

```shell
$ npm install uriel
```

#### [Usage](#embedded-usage)
<a name="embedded-usage"></a>
Within a library or application, add the following code:

```js
  const Uriel = require('uriel');

  // Create a new agent
  let statsd = new Uriel(config, logger);

  // Initialize and start the uriel agent
  statsd.init();

  // close and shutdown the uriel agent
  statsd.close();
```

**Note:** The same considerations for firewall rules must be made when running the Uriel service in embedded mode.

#### [API](#embedded-api)
<a name="embedded-api"></a>

##### constructor(config[, logger])
Create a new Uriel agent.
```js
const Uriel = require('uriel');

let statsd = new Uriel(config, logger);
```

Where the [`config`](#uriel-configuration) and [`logger`](#uriel-logger) parameters are as outlined below. The `logger` is optional, and if no logger is provided then all logging is sent to `/dev/null`.

##### .init()
Initializes and starts the Uriel statsD agent
```js
statsd.init();
```

##### .close()
Shuts down the Uriel StatsD agent. Because the agent maintains an active thread, this operation must be performed to allow the application to gracefully shut down.
```js
statsd.close();
```

## [Configuration Object](#uriel-configuration)
<a name="uriel-configuration"></a>

The configuration parameter expects and object that contains the following (with defaults provided below):
```js
{
  server: {
    shutdownTime: 1000,
    pollingTimer: 5000
  },
  logging: {
    // Logging Configuration
    logDir: './logs',
    options: { json: false, maxsize: '10000000', maxFiles: '10', level: 'silly' }
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

|parameter|type|description|
|---------|----|-----------|
|**`server.shutdownTime`**|Integer|Time in millisecond to allow for graceful shutdown|
|**`server.pollingTime`**|Integer|Time in millisecond to wait between polling the system information and delivering to statsd|
|**`logging.logDir`**|Integer|The full or relative path (from the Uriel base folder to store logs|
|**`logging.options.json`**|Boolean|Store Uriel service events in JSON format|
|**`logging.options.maxsize`**|Integer String|Max logfile size in bytes before logrotation|
|**`logging.options.maxFiles`**|Integer String|Max number of rotated logfiles to keep for logrotation|
|**`logging.options.level`**|String|The lowest log level to store in files (silly,debug,info,warn,error)|
|**`statsd.host`**|String|IP/Domain of the statsd server for this configuration|
|**`statsd.port`**|Integer|UDP Port that handles the system information|
|**`statsd.name`**|String|the `serverName` tag that is provided for all stats that are pushed. This allows info from differing servers to be distinguished from one another|
|**`statsd.attachHostName`**|Boolean|`true` or `false` value that specifies that the os hostname should be appended to the `serverName`|
|**`statsd.telegraf`**|Boolean|`true` or `false` value that specifies that the listening server is running telegraf|

## [Logging Object](#uriel-logging)
<a name="relay-logging"></a>
The Logging object is an instance of any logging library, such as [Winston](https://www.npmjs.com/package/winston) or [Bunyan](https://www.npmjs.com/package/bunyan), which support the `.error(...)`, `.info(...)`, `.debug(...)`, and `.log(...)` methods. When in stand-alone mode, the service will use the configuration values to create an instance of Winston.

## [Statsd Buckets](#statsd-buckets)
<a name="statsd-buckets"></a>
The following buckets are used to capture statistics:

|name|domain|description|
|----|------|-----------|
|**`system.uptime`**|System|System uptime|
|**`system.load1`**|System|System 1-minute average load|
|**`system.load5`**|System|System 5-minute average load|
|**`system.load15`**|System|System 15-minute average load|
|**`cpu.usage_user`**|CPU|% of CPU usage from user processes|
|**`cpu.usage_nice`**|CPU|% of CPU usage from low-priority/background processes|
|**`cpu.usage_system`**|CPU|% of CPU usage from system/kernel processes|
|**`cpu.usage_idle`**|CPU|% of CPU idle|
|**`cpu.usage_irq`**|CPU|% of CPU usage from system IRQs|
|**`cpu.usage_total`**|CPU|% of non-idle CPU usage|
|**`mem.free`**|Memory|Free Memory (in bytes)|
|**`mem.free_percent`**|Memory|% of Free Memory|
|**`mem.total`**|Memory|Total Memory (in bytes)|
|**`mem.used`**|Memory|Used Memory (in bytes)|
|**`mem.used_percent`**|Memory|% of Used Memory|
|**`network.close_wait`**|Network|Count of network packets in `CLOSED_WAIT` state|
|**`network.foreign`**|Network|Count of network packets in `FOREIGN` state|
|**`network.established`**|Network|Count of network packets in `ESTABLISHED` state|
|**`network.last_ack`**|Network|Count of network packets in `LAST_ACK` state|
|**`network.listen`**|Network|Count of network packets in `LISTEN` state|
|**`network.syn_sent`**|Network|Count of network packets in `SYN_SENT` state|
|**`network.time_wait`**|Network|Count of network packets in `TIME_WAIT` state|
|**`diskio.io_time`**|Disk I/O|Current time spent doing I/O (in milliseconds) (1s = 100% load)|
|**`diskio.iops_in_progress`**|Disk I/O|Count of current number of disk operations|
|**`diskio.weighted_io_time`**|Disk I/O|Measure of both I/O completion and estimated backlog|
|**`diskio.read_bytes`**|Disk I/O|Total number of bytes read from disk|
|**`diskio.read_time`**|Disk I/O|Total I/O time (1/100th of seconds) for read requests to disk|
|**`diskio.write_bytes`**|Disk I/O|Total number of bytes written to disk|
|**`diskio.write_time`**|Disk I/O|Total I/O time (1/100th of seconds) for write requests to disk|
|**`disk.free`**|Disk Usage|Free Disk (in bytes)|
|**`disk.free_percent`**|Disk Usage|% of Free Disk|
|**`disk.total`**|Disk Usage|Total Disk (in bytes)|
|**`disk.used`**|Disk Usage|Used Disk (in bytes)|
|**`disk.used_percent`**|Disk Usage|% of Used Disk|
|**`swap.free`**|Swap Usage|Free Swap (in bytes)|
|**`swap.free_percent`**|Swap Usage|% of Free Swap|
|**`swap.total`**|Swap Usage|Total Swap (in bytes)|
|**`swap.used`**|Swap Usage|Used Swap (in bytes)|
|**`swap.used_percent`**|Swap Usage|% of Used Swap|

**Note:** CPU or Disk Usage reflect the combined usage across all CPUs or Disks.

# [License](#license)
<a name="license"></a>

Copyright (c) 2017, 2018 Jay Reardon -- Licensed under the MIT license.
