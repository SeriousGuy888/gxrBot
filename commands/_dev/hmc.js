const { hangman } = require("../../config/_config.js")

exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const hangmanCache = index.gameCache.hangman

  if(message.author.id !== config.admins.superadmin.id)
    return
  
  message.channel.send("```\n" + JSON.stringify(hangmanCache) + "\n```")
}