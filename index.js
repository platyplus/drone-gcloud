const configString = process.env.PLUGIN_CONFIG
const commandsString = process.env.PLUGIN_COMMANDS
console.log(credentialsEncoded, configString, commandsString)
// * Convert the credentials
const credentialsEncoded = process.env.PLUGIN_CREDENTIALS
const buffer = new Buffer(credentialsEncoded, 'base64')
const credentials = buffer.toString('ascii')
console.log(credentials)
// TODO * Write the credentials into a temporaty file
// TODO * authenticate
// TODO * Remove the temporary file
let config = JSON.parse(configString)
console.log(config)
if (typeof config === 'string') config = config.split(',')
for (item of config) {
  console.log(item)
}
