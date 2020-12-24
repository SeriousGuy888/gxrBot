exports.run = (message) => {
  const index = require("../index.js")
  const { config, prefix } = index

  const args = message
    .content // message content
    .slice(prefix.length) // remove prefix
    .trim() // remove leading and trailing whitespace
    .split(/ +/g) // split at any space or multiple spaces
  const commandName = args
    .shift() // remove first argument and use as command name
    .toLowerCase() // lowercase command name
    .trim() // remove whitespace
    .slice(0, config.main.maxCommandNameLength) // cap command name length
  
  return {
    args,
    commandName,
  }
}