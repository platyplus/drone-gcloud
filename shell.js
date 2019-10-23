'use strict'
const child_process = require('child_process')
const { LOG_LEVELS, log, error } = require('./log')

// * Run a command
const exec = (command, errorMessage) => {
  try {
    log(`${command}`, LOG_LEVELS.info)
    const result = child_process.execSync(command).toString()
    log(result, LOG_LEVELS.verbose)
    return result.trim()
  } catch (error) {
    errorExit(errorMessage, error)
  }
}

// * Exit the script with an error
const errorExit = (message, err = undefined) => {
  error(message, LOG_LEVELS.info)
  if (err) error(err, LOG_LEVELS.verbose)
  process.exit(1)
}

module.exports = { exec, errorExit }
