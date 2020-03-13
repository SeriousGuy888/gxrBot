module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix

  const db = index.db
  let cultCache = index.cultCache
  let cultChannelId = cultCache.id.slice(2, cultCache.id.length - 1) // remove <# and > from channel mention to get id
  let cultPhrase = cultCache.word

  let args
  let command
  let cmd

  if(message.content.toLowerCase().indexOf(prefix) === 0) {
    if(message.author.bot) return //ignore bots

    args = message.content.slice(prefix.length).trim().split(/ +/g)
    command = args.shift().toLowerCase().trim()

    cmd = client.commands.get(command) //grab cmds from enmap

    if(!cmd) return message.channel.send(`\`ERROR\`: Command \`${prefix}${command}\` not found.`)
    cmd.run(client, message, args)
  }

  if(message.channel.id === cultChannelId) {
    const emojiEquivilants = {
      a: "🇦",
      b: "🇧",
      c: "🇨",
      d: "🇩",
      e: "🇪",
      f: "🇫",
      g: "🇬",
      h: "🇭",
      i: "🇮",
      j: "🇯",
      k: "🇰",
      l: "🇱",
      m: "🇲",
      n: "🇳",
      o: "🇴",
      p: "🇵",
      q: "🇶",
      r: "🇷",
      s: "🇸",
      t: "🇹",
      u: "🇺",
      v: "🇻",
      w: "🇼",
      x: "🇽",
      y: "🇾",
      z: "🇿"
    }
    const letters = "abcdefghijklmnopqrstuvwxyz"

    function messageLegal(msg, phrase) {
      if(!msg || !phrase) return console.log("error with cult code in message.js event")

      msg = msg.toLowerCase()
      phrase = phrase.toLowerCase()

      for(var i = 0; i < letters.length; i++) {
        msg = msg.replace(new RegExp(emojiEquivilants[i], "gi"), letters.charAt(i))
      }
      console.log(msg)

      if(msg == phrase) return true
    }

    if(messageLegal(message.content, cultPhrase)) return

    else message.delete().then(() => {
      if(message.author.bot) return
      message.channel.send(`You are in violation of the cult rules.\nYou may only say \`${cultPhrase}\` here.`).then(msg => {
        msg.delete(3000) // delete message in 3 seconds
      }).catch(err => {})
    })
  }
}
