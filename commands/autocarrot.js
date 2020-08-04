exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const autocarrotWebhook = index.autocarrotWebhook
  
  return message.channel.send("Command disabled.")
  // autocarrotWebhook(message.author, message.channel, args.join(" "))
}