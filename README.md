# Uriel

[![NPM](https://nodei.co/npm/uriel.png?downloads=true)](https://nodei.co/npm/uriel/)

[![Actual version published on npm](http://img.shields.io/npm/v/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Travis build status](https://travis-ci.com/OutOfSyncStudios/uriel.svg)](https://travis-ci.com/OutOfSyncStudios/uriel)
[![Total npm module downloads](http://img.shields.io/npm/dt/uriel.svg)](https://www.npmjs.org/package/uriel)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ced17e413a2e48b0b27c3bc691a7c479)](https://www.codacy.com/manual/OutOfSyncStudios/uriel?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=OutOfSyncStudios/uriel&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/ced17e413a2e48b0b27c3bc691a7c479)](https://www.codacy.com/app/OutOfSyncStudios/uriel?utm_source=github.com&utm_medium=referral&utm_content=OutOfSyncStudios/uriel&utm_campaign=Badge_Coverage)
[![Dependencies badge](https://david-dm.org/OutOfSyncStudios/uriel/status.svg)](https://david-dm.org/OutOfSyncStudios/uriel?view=list)

A simple service that pushes system information (e.g. system usage, memory, cpu, network, swap, diskio, and disk usage) to any compatible statsd service (e.g. StatsD, Telegraf, DogStatsD, etc.)

***Note:*** Version 2.0.0 contains breaking changes to how some statistics are delivered to the statsd server, and how the Uriel process is configured. Please consult the documentation for information on these breakages.

# Table of Contents

  1. [Migrating from 1.x](#migrating)
  2. [Documentation](#documentation)
      1. [Modes of Operation](#uriel-modes)
          1. [Stand-alone Service](#standalone)
              1. [Installation](#standalone-installation)
              2. [Configuration](#standalone-configuration)
              3. [Running](#standalone-running)
          2. [Docker Container](#docker)
              1. [Installation](#docker-installation)
              2. [Configuration](#docker-configuration)
              3. [Running](#docker-running)
          3. [Embedded Service](#embedded)
              1. [Installation](#embedded-installation)
              2. [Usage](#embedded-usage)
              3. [API](#embedded-api)
      2. [Configuration Object](#uriel-configuration)
      3. [Logging Object](#uriel-logging)
      4. [Statsd Buckets](#statsd-buckets)
  3. [Changelog](#changelog)
  4. [License](#license)

# Goals
**`Uriel`** is designed to be a lightweight NodeJS agent that gathers system information and delivers it to a compatible statsd service over UDP. It can be embedded within another service, or setup and configured as its own stand-alone service that runs on the system being monitored. At the time of creation, other NodeJS systeminfo agents were unsuitable due to their inflexibility or poor implementations. Uriel was created to (ideally) bridge those shortcomings. It uses UDP, because of the decreased network overhead that is required in comparison to TCP.

The name [Uriel](https://en.wikipedia.org/wiki/Uriel) is associated with Abrahamic religions for the Archangel which represents the light of the divine and as one who had dominion over another type of angel, the Gregori (a.k.a. ***The Watchers***). The name was chosen both because of its association with illuminating dark places and watching things which are two abstract concepts related to system monitoring.

<a name="migrating"></a>
# [Migrating from 1.x](#migrating)
So that grouped dashboards are possible, version 2.x moves CPU and Disk Usage reporting for individual cpu/disks and the aggregate totals into tagged metrics. Any dashboards which rely on this reporting will need to be updated as follows:
  * If you are monitoring total CPU or Disk stats, then you will need to update your dashboards to look for the `cpu:total` or `disk:total` respectively.
  * If you are monitoring individual CPU or Disks, then you will need to update your dashboards from `cpu.cpu0_usage_idle` / `disk.disk0_free` to `cpu.usage_idle` / `disk.free` with tags `cpu:0` / `disk:0`.

It is also now possible to configure global tags which are sent for all metrics in the server configuration. These are setup with the `statsd.tags` array of the server configuration. This allows for
systems being monitored in auto-scaling groups or under load-balancing to be grouped together by shared tags in dashboards. This is especially useful under architectures where the exact specification (size/number of systems/etc.) is mutable.

<a name="documentataion"></a>
# [Documentation](#documentation)

<a name="relay-modes"></a>
## [Modes of Operation](#relay-modes)

The Uriel service has three modes of operation:
  * [Stand-alone Service](#standalone)
  * [Docker Container](#docker)
  * [Embedded Service](#embedded)

  <a name="standalone"></a>
### [Stand-alone Service](#standalone)

The stand-alone service option is available when it is desirable to use new/existing server architecture and more control over the environment is required.

<a name="standalone-installation"></a>
#### [Installation](#standalone-installation)

To install, clone the git repository:


```
$ git clone https://github.com/OutOfSyncStudios/uriel.git
$ cd uriel
```

<a name="standalone-configuration"></a>
#### [Configuration](#standalone-configuration)

To configure, run:
```shell
npm run config
```
This will ask a series of questions which provides the base configuration. Alternatively, it is possible to manually edit the `<uriel-base>/config/config.js` file to make adjustments. The configuration file is an exported version of the [Configuration Object](#relay-configuration).

<a name="standalone-running"></a>
#### [Running](#standalone-running)

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

<a name="docker"></a>
### [Docker Container](#docker)

<a name="docker-installation"></a>
#### [Installation](#docker-installation)

To install, clone the git repository:

```
$ git clone https://github.com/OutOfSyncStudios/uriel.git
$ cd uriel
```

<a name="docker-configuration"></a>
#### [Configuration](#docker-configuration)

To configure, run:
```shell
npm run config
```
This will ask a series of questions which provides the base configuration. Alternatively, it is possible to manually edit the `<uriel-base>/config/config.js` file to make adjustments. The configuration file is an exported version of the [Configuration Object](#uriel-configuration).

<a name="docker-running"></a>
#### [Running](#docker-running)

Before running, ensure that a compatible statsd service is configured to listen for events on the configured port and the any firewall rules are open between the service and the statsd service.

##### Building the Docker Image
```shell
$ npm run docker-build
```

##### Running the Built Docker Image
```shell
$ npm run docker-run
```

<a name="embedded"></a>
### [Embedded Service](#embedded)

The embedded option is available if including the service bundled as a part of another service is desired.

<a name="embedded-installation"></a>
#### [Installation](#embedded-installation)

```shell
$ npm install uriel
```

<a name="embedded-usage"></a>
#### [Usage](#embedded-usage)
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

<a name="embedded-api"></a>
#### [API](#embedded-api)

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

<a name="uriel-configuration"></a>
## [Configuration Object](#uriel-configuration)

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
    telegraf: false,
    tags: []
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
|**`statsd.tags`**|Array<string>|An array of tag strings formatted `key:value` that are passed onto the statsd server

<a name="relay-logging"></a>
## [Logging Object](#uriel-logging)
The Logging object is an instance of any logging library, such as [Winston](https://www.npmjs.com/package/winston) or [Bunyan](https://www.npmjs.com/package/bunyan), which support the `.error(...)`, `.info(...)`, `.debug(...)`, and `.log(...)` methods. When in stand-alone mode, the service will use the configuration values to create an instance of Winston.

<a name="statsd-buckets"></a>
## [Statsd Buckets](#statsd-buckets)
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
|**`cpu.num_cpus`**|CPU|Count of CPUs on the system|
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
|**`disk.num_disks`**|Disk Usage|Count of Disks in the system|
|**`swap.free`**|Swap Usage|Free Swap (in bytes)|
|**`swap.free_percent`**|Swap Usage|% of Free Swap|
|**`swap.total`**|Swap Usage|Total Swap (in bytes)|
|**`swap.used`**|Swap Usage|Used Swap (in bytes)|
|**`swap.used_percent`**|Swap Usage|% of Used Swap|

**Note:** CPU or Disk Usage are delivered as tagged sets, with the 'cpu' and 'disk' tags respectively to mark the individual cpu or disk numbers or the 'total' for the aggregation of all cpus or disks.

<a name="changelog"></a>
# [Changelog](#changelog)

## 2.0.2
* Minor bug fixes

## 2.0.1
* Minor bug fixes

## 2.0.0
***Note***: This is a major version change that contains breaking changes to the old function & reporting. Please review the documentation for updates to how data is now reported.
* Improvements on delivery and handling of tagged metrics, an array of tags can now be configured to be delivered with each metric
* CPU and Disk Usage reporting are now delivered as tagged sets of data. The `cpu` and `disk` tags provide enumerate each of the individual cpus and disks; or have the tag value `total` to indicate the aggregation of all items.
* Refactored all monitors to be execute as Promises to reduce memory and cpu overhead
* Refactored statistics collection to use a factory pattern in an effort to further reduce memory overhead
* Migrated to Winston v3 logging

## 1.9.6
* Updating outdated dependencies again
* Additional improved logging
* Removed unnecessary dependencies

## 1.9.5
* Finally fixed CPU / Memory leak causing CPU panic
* Improved Logging
* Improved Unit Testing to check for the fixed bug

## 1.9.4
* Reverting hot-shots and systeminformation version to previous version in 1.8 branch as fix for the CPU race condition that is still being reported

## 1.9.3
* Reverting systeminformation dependency to version 3.51 -- the Physical CPU gathering logic added added in 3.52 causes major issues with cpu usage overhead

## 1.9.2
* Additional optimization of the inner monitoring loop

## 1.9.1
* Fixed bug causing excessive CPU usage when Uriel had been running for a while

## 1.9.0
* Moved some logging messages to `silly` level logging.
* Added `tags` configuration array so that other metrics may be hard passed to statsd

## 1.8.1
* Fixing console logging bug

## 1.8.0
* Added Docker support
* Added individual CPU and Disk reporting

## 1.7.0
* Fixed all outdated dependencies and security vulnerabilities

<a name="license"></a>
# [License](#license)

Copyright © 2017, 2018, 2019 Jay Reardon
Copyright © 2019 Out of Sync Studios LLC  -- Licensed under the MIT license.
