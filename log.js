'use strict'
const LOG_LEVELS = {
  silent: 0,
  info: 1,
  log: 2,
  verbose: 3
}
const LOG_LEVEL = LOG_LEVELS[process.env.PLUGIN_LOG_LEVEL || 'info'] || 1

const log = (message, level = LOG_LEVELS.log, logFunction = console.log) =>
  LOG_LEVEL >= level && logFunction(message)

const error = (message, level = LOG_LEVELS.silent) =>
  log(message, level, console.error)

const warn = (message, level = LOG_LEVELS.info) =>
  log(message, level, console.warn)

module.exports = { LOG_LEVELS, log, error, warn }
