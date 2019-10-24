'use strict'
const child_process = require('child_process')
const { LOG_LEVELS, log, error, warn } = require('./log')

// * Run a command
const exec = (command, errorMessage, skipError = false) => {
  try {
    log(`${command}`, LOG_LEVELS.info)
    const result = child_process.execSync(command).toString()
    log(result, skipError ? LOG_LEVELS.info : LOG_LEVELS.log)
    return result.trim()
  } catch (error) {
    if (!skipError) errorExit(errorMessage, error.toString())
  }
}

// * Exit the script with an error
const errorExit = (message, err = undefined) => {
  error(message)
  if (err) error(err, LOG_LEVELS.log)
  process.exit(1)
}

module.exports = { exec, errorExit }
