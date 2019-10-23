'use strict'
const fs = require('fs')
const child_process = require('child_process')
const TEMP_CREDENTIALS_FILE = '.credentials'

// * Exit the script with an error
const exit = (message, error = undefined) => {
  console.error(message)
  if (error) console.error(error)
  process.exit(1)
}

// Run a command
const run = (command, errorMessage) => {
  try {
    console.log(`Run: ${command}`)
    const result = child_process.execSync(command).toString()
    console.log(result)
    return result.trim()
  } catch (error) {
    exit(errorMessage, error)
  }
}

const getSingleton = (item, { key, value } = {}) => {
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
  exit('No credentials')
}
// * Store the credentials into a temporary file
try {
  fs.writeFileSync(TEMP_CREDENTIALS_FILE, credentialsEncoded, {
    encoding: 'base64'
  })
} catch (error) {
  exit('Invalid credentials.', error)
}
// * authenticate
run(
  `gcloud auth activate-service-account --key-file ${TEMP_CREDENTIALS_FILE}`,
  'Authentication failed. See the following error:'
)
// * Delete the temporaty credentials file
try {
  fs.unlinkSync(TEMP_CREDENTIALS_FILE)
} catch (error) {
  exit('Impossible to remove the temporary credentials file.', error)
}

// * Set the configuration, if it exists
const configString = process.env.PLUGIN_CONFIG
if (configString) {
  try {
    let config = JSON.parse(configString)
    if (typeof config === 'string') config = config.split(',')
    for (const item of config) {
      const { key, value } = getSingleton(item)
      if (!key) exit(`Invalid configuration key: ${item}`, error)
      run(
        `gcloud config set ${key} ${value}`,
        `Error in the configuration at ${item}`
      )
    }
  } catch (error) {
    exit('Error in loading the Google Cloud configuration.', error)
  }
}

// * Run the commands
const commandsString = process.env.PLUGIN_COMMANDS
if (commandsString) {
  try {
    let commands = JSON.parse(commandsString)
    if (typeof commands === 'string') commands = commands.split(',')
    for (let command of commands) {
      let { key, value } = getSingleton(command, {
        key: 'export',
        value: 'command'
      })
      if (command.flags) {
        if (typeof command.flags === 'string') value += ` --${command.flags}`
        else if (Array.isArray(command.flags)) {
          for (let flag of command.flags) {
            flag = getSingleton(flag)
            value +=
              ' --' + (flag.key ? `${flag.key}="${flag.value}"` : flag.value)
          }
        }
      }
      const result = run(`gcloud ${value}`, 'Error in the command')
      if (key) process.env[key] = result
    }
  } catch (error) {
    exit('Error in the Google Cloud commands.', error)
  }
} else {
  console.warn('No commands found. Nothing done.')
}
