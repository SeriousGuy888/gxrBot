exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord

  message.channel.send(`Cult channel is <#${index.cultCache}>`)
}