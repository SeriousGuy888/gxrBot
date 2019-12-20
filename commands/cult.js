exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  var cultCache = index.cultCache

  return message.channel.send(cultCache)
}