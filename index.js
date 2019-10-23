'use strict'
const fs = require('fs')
const child_process = require('child_process')
const TEMP_CREDENTIALS_FILE = '.credentials'
const exit = function(message, error = undefined) {
  console.error(message)
  if (error) console.error(error)
  process.exit(1)
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
try {
  const command = `gcloud auth activate-service-account --key-file ${TEMP_CREDENTIALS_FILE}`
  console.log(`Run: ${command}`)
  child_process.execSync(command)
} catch (error) {
  exit('Authentication failed. See the following error:', error)
}
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
    //   if (typeof config === 'string') config = config.split(',')
    for (const item of config) {
      if (typeof item === 'string') {
        exit(`Invalid configuration param: ${item}`, error)
      }
      try {
        const param = Object.keys(item)[0]
        const value = item[param]
        const command = `gcloud config set ${param} ${value}`
        console.log(`Run: ${command}`)
        child_process.execSync(command)
      } catch (error) {
        exit(`Error in the configuration at ${item}`, error)
      }
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
      let destVariable
      if (typeof command !== 'string') {
        destVariable = Object.keys(command)[0]
        command = command[destVariable]
      }
      console.log(`Run: gcloud ${command}`)
      const result = child_process
        .execSync(`gcloud ${command}`)
        .toString()
        .trim()
      if (destVariable) process.env[destVariable] = result
      console.log(result)
    }
  } catch (error) {
    exit('Error in the Google Cloud commands.', error)
  }
} else {
  console.warn('No commands found. Nothing done.')
}
// console.log(process.env)
