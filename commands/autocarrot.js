exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const autocarrotWebhook = index.autocarrotWebhook
  
  message.channel.send("Current autocarrot config in raw JSON :D\n```json" + JSON.stringify(index.config.autocarrot, null, 2) + "```")

  // return message.channel.send("Command disabled.")
  // autocarrotWebhook(message.author, message.channel, args.join(" "))
}