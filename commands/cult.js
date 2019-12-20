exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord

  message.channel.send(`Cult channel is <#${index.cultCache}>\nThis command is currently work in progress. There will be a feature to censor all instances of free speech using this feature.`)
}