const { hangman } = require("../../config/_config.js")

exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const hangmanCache = index.gameCache.hangman

  if(message.author.id !== config.admins.superadmin.id)
    return message.channel.send("You may not use this dev command!")
  
  if(!args[0]) {
    message.channel.send("```json\n" + JSON.stringify(hangmanCache, (key, value) => {
      if(key == "message")
        return value.id
      else
        return value
    }, 4) + "\n```")
  }
  else {
    let id = args[0]
    let prop = args[1]
    let val = args.splice(2).join(" ")

    hangmanCache[id][prop] = val
    message.channel.send("ok")
  }
}