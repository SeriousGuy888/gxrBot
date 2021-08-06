exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const logger = client.util.get("logger")

  if(message.author.id !== config.admins.superadmin.id)
    return message.channel.send({ content: "You may not use this dev command!" })

  logger.uploadLogs(`Log upload request from ${message.author.tag}`)
    .then(() => message.channel.send({ content: `Logs have been uploaded to <#${config.logger.uploads.channel}>.` }))
  
  logger.log(`${message.author.id} requested log upload`, "logs command")
}

exports.dev = true