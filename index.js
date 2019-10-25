'use strict'
const fs = require('fs')
const TMP_KEY_FILE = '/tmp/.credentials'
const { exec, errorExit } = require('./shell')
const { getParameter, joinParameter, parse } = require('./helpers')

const credentials =
  process.env.PLUGIN_CREDENTIALS || errorExit('No credentials key file')
// * Store the credentials into a temporary file
try {
  fs.writeFileSync(TMP_KEY_FILE, credentials, { encoding: 'base64' })
} catch (error) {
  errorExit('Invalid credentials key file.', error)
}
// * authenticate
const auth = exec(
  `gcloud auth activate-service-account --key-file ${TMP_KEY_FILE}`,
  'Authentication failed. Error:',
  true
)
// * Delete the temporaty credentials file
try {
  fs.unlinkSync(TMP_KEY_FILE)
} catch (error) {
  errorExit('Impossible to remove the temporary credentials file.', error)
}
if (!auth) process.exit(1)

// * Set the project id that has been found in the credentials key
const project_id = JSON.parse(
  new Buffer(credentials, 'base64').toString('ascii')
).project_id
exec(
  `gcloud config set project ${project_id}`,
  `Error setting the project id ${project_id}`
)

// * Set the configuration, if it exists
try {
  for (const item of parse(process.env.PLUGIN_CONFIG)) {
    const { key, value } = getParameter(item)
    if (!key) errorExit(`Invalid configuration key: ${item}`)
    exec(
      `gcloud config set ${key} ${value}`,
      `Error in the configuration at ${item}`
    )
  }
} catch (error) {
  errorExit('Error in loading the Google Cloud configuration.', error)
}

// * Run the commands
try {
  for (let command of parse(process.env.PLUGIN_COMMANDS)) {
    let { key, value } = getParameter(command, {
      key: 'export',
      value: 'command'
    })
    if (command.flags) {
      if (typeof command.flags === 'string') value += ` --${command.flags}`
      else if (Array.isArray(command.flags)) {
        for (let flag of command.flags) {
          flag = getParameter(flag)
          value += ` --${flag.key || flag.value}`
          if (flag.key) value += ` ${joinParameter(flag.value)}`
        }
      }
    }
    const result = exec(
      `gcloud ${value}`,
      'Error in the command',
      command.skipError
    )
    if (key) process.env[key] = result
  }
} catch (error) {
  errorExit('Error in the Google Cloud commands.', error)
}
