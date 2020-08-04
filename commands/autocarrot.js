exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const autocarrotWebhook = index.autocarrotWebhook
  
  autocarrotWebhook(message.author, message.channel, args.join(" "))
  // message.delete()
}