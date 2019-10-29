#!/usr/bin/env node
/* eslint-disable no-console */
const configFile = './config/config.js';

const __ = require('lodash');
const fs = require('fs');
const inquirer = require('inquirer');
const validate = require('./validate');
const baseConfig = require('../config/default-config');
const config = require('../config/config');

const conf = __.merge(baseConfig, config);

const modes = [
  'Stand-alone Service',
  'Embedded service'
];

const questions = [];

function validateInt(val) {
  return validate(val, 'int');
}

function minTime(val, min) {
  if (val >= min) {
    return true;
  }
  return `Value must be greater or equal to ${min}`;
}

function intMinTime(val) {
  let msg = validateInt(val);
  if (msg === true) {
    msg = minTime(val, 1000);
  }
  return msg;
}

function setupQuestions() {
  questions.push({
    type: 'list',
    name: 'mode',
    default: modes,
    choices: modes,
    message: 'Select the service mode:',
  }, {
    type: 'input',
    name: 'shutdownTime',
    default: conf.server.shutdownTime,
    message: 'Graceful server shutdown period in milliseconds:',
    validate: validateInt
  }, {
    type: 'input',
    name: 'pollingTimer',
    default: conf.server.pollingTimer,
    message: 'System Info polling frequency in millisecond:',
    validate: intMinTime
  }, {
    type: 'input',
    name: 'logDir',
    default: conf.logging.logDir,
    message: 'Full or relative path (from service base) to the log folder:',
    when: (answers) => {
      return (answers.mode === modes[0]);
    }
  }, {
    type: 'confirm',
    name: 'logJson',
    default: conf.logging.options.json,
    message: 'JSON logging?',
    when: (answers) => {
      return (answers.mode === modes[0]);
    }
  }, {
    type: 'input',
    name: 'logMaxSize',
    default: conf.logging.options.maxsize,
    message: 'Max log file size in bytes:',
    validate: validateInt,
    when: (answers) => {
      return (answers.mode === modes[0]);
    }
  }, {
    type: 'input',
    name: 'logMaxFiles',
    default: conf.logging.options.maxFiles,
    message: 'Max number of rotated log files:',
    validate: validateInt,
    when: (answers) => {
      return (answers.mode === modes[0]);
    }
  }, {
    type: 'list',
    name: 'logLevel',
    choices: ['silly', 'debug', 'verbose', 'info', 'warn', 'error'],
    default: conf.logging.options.level,
    message: 'Select lowest logging level:',
    when: (answers) => {
      return (answers.mode === modes[0]);
    }
  }, {
    type: 'input',
    name: 'statsdHost',
    default: conf.statsd.host,
    message: 'Enter the Statsd IP or Hostname:'
  }, {
    type: 'input',
    name: 'statsdPort',
    default: conf.statsd.port,
    message: 'Enter the Statsd UDP port:',
    validate: validateInt
  }, {
    type: 'input',
    name: 'statsdName',
    default: conf.statsd.name,
    message: 'Enter the server name to report as:'
  }, {
    type: 'confirm',
    name: 'statsdAttachHostName',
    default: conf.statsd.attachHostName,
    message: 'Do you want to attach the OS Hostname to the servername?'
  }, {
    type: 'confirm',
    name: 'statsdTelegraf',
    default: conf.statsd.telegraf,
    message: 'Is the statsd server running Telegraf?'
  });
}

function mapAnswers(answers) {
  conf.server.shutdownTime = answers.shutdownTime;
  conf.server.pollingTimer = answers.pollingTimer;
  if (answers.logDir) { conf.logging.logDir = answers.logDir; }
  if (answers.logJson) { conf.logging.options.json = answers.logJson; }
  if (answers.logMaxSize) { conf.logging.options.maxsize = answers.logMaxSize; }
  if (answers.logMaxFiles) { conf.logging.options.maxFiles = answers.logMaxFiles; }
  if (answers.logLevel) { conf.logging.options.level = answers.logLevel; }
  conf.statsd.host = answers.statsdHost;
  conf.statsd.port = answers.statsdPort;
  conf.statsd.name = answers.statsdName;
  conf.statsd.attachHostName = answers.statsdAttachHostName;
  conf.statsd.telegraf = answers.statsdTelegraf;
}

function doConfig() {
  setupQuestions();
  inquirer.prompt(questions)
    .then((answers) => {
      mapAnswers(answers);
      fs.writeFileSync(configFile, `module.exports = ${JSON.stringify(conf, null, 2)};`);
    })
    .catch((err) => {
      console.error(err.stack || err);
    });
}


inquirer.prompt([
  {
    type: 'confirm',
    name: 'ok',
    default: false,
    message: 'This option will overwrite your existing configuration. Are you sure?'
  }
])
  .then((answers) => {
    if (answers.ok) {
      doConfig();
    } else {
      console.log('Operation aborted');
    }
  })
  .catch((err) => {
    console.error(err.stack || err);
  });
