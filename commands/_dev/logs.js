exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const logger = client.util.get("logger")

  if(message.author.id !== config.admins.superadmin.id)
    return message.channel.send("You may not use this dev command!")
  
  logger.log(`${message.author.id} requested log upload`)
  logger.uploadLogs()
}

exports.dev = true