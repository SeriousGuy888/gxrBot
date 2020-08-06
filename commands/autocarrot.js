exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const autocarrotWebhook = index.autocarrotWebhook
  
  message.channel.send("Current autocarrot config. I'm too lazy to format it so it's raw JSON. ```" + JSON.stringify(index.config.autocarrot) + "```")

  // return message.channel.send("Command disabled.")
  // autocarrotWebhook(message.author, message.channel, args.join(" "))
}