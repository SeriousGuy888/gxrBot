exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const db = index.db

  return message.channel.send("hi")
}