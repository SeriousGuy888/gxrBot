const { hangman } = require("../../config/_config.js")

exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const hangmanCache = index.gameCache.hangman

  if(message.author.id !== config.admins.superadmin.id)
    return message.channel.send("You may not use this dev command!")
  
  message.channel.send("```json\n" + JSON.stringify(hangmanCache, null, 4) + "\n```")
}