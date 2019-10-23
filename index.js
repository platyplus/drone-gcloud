'use strict'
const fs = require('fs')
const TEMP_CREDENTIALS_FILE = '.credentials'
const { exec, errorExit } = require('./shell')
const { warn } = require('./log')

const getParameter = (item, { key, value } = {}) => {
  if (typeof item === 'string') return { value: item }
  if (Object.keys(item).length === 1) {
    key = Object.keys(item)[0]
    return {
      key,
      value: item[key]
    }
  } else return { key: item[key], value: item[value] }
}

const credentialsEncoded = process.env.PLUGIN_CREDENTIALS
if (!credentialsEncoded) {
  errorExit('No credentials')
}
// * Store the credentials into a temporary file
try {
  fs.writeFileSync(TEMP_CREDENTIALS_FILE, credentialsEncoded, {
    encoding: 'base64'
  })
} catch (err) {
  errorExit('Invalid credentials.', err)
}
// * authenticate
exec(
  `gcloud auth activate-service-account --key-file ${TEMP_CREDENTIALS_FILE}`,
  'Authentication failed. See the following error:'
)
// * Delete the temporaty credentials file
try {
  fs.unlinkSync(TEMP_CREDENTIALS_FILE)
} catch (error) {
  errorExit('Impossible to remove the temporary credentials file.', error)
}

// * Set the configuration, if it exists
const configString = process.env.PLUGIN_CONFIG
if (configString) {
  try {
    let config = JSON.parse(configString)
    if (typeof config === 'string') config = config.split(',')
    for (const item of config) {
      const { key, value } = getParameter(item)
      if (!key) errorExit(`Invalid configuration key: ${item}`)
      exec(
        `gcloud config set ${key} ${value}`,
        `Error in the configuration at ${item}`
      )
    }
  } catch (err) {
    errorExit('Error in loading the Google Cloud configuration.', err)
  }
}

// * Run the commands
const commandsString = process.env.PLUGIN_COMMANDS
if (commandsString) {
  try {
    let commands = JSON.parse(commandsString)
    if (typeof commands === 'string') commands = commands.split(',')
    for (let command of commands) {
      let { key, value } = getParameter(command, {
        key: 'export',
        value: 'command'
      })
      if (command.flags) {
        if (typeof command.flags === 'string') value += ` --${command.flags}`
        else if (Array.isArray(command.flags)) {
          for (let flag of command.flags) {
            flag = getParameter(flag)
            value +=
              ' --' + (flag.key ? `${flag.key}="${flag.value}"` : flag.value)
          }
        }
      }
      const result = exec(`gcloud ${value}`, 'Error in the command')
      if (key) process.env[key] = result
    }
  } catch (err) {
    errorExit('Error in the Google Cloud commands.', err)
  }
} else {
  warn('No commands found. Nothing done.')
}
