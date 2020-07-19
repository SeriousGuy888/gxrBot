module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix

  const db = index.db

  let cultCache = index.cultCache
  let cultChannelId = cultCache.id.slice(2, cultCache.id.length - 1) // remove <# and > from channel mention to get id
  let cultPhrase = cultCache.word

  let owsCache = index.owsCache
  let owsChannelId = owsCache.id.slice(2, owsCache.id.length - 1) // remove <# and > from channel mention to get id

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
    function messageLegal(msg, phrase) {
      if(!msg || !phrase) return console.log("error with cult code in message.js event")

      msg = msg.toLowerCase()
      phrase = phrase.toLowerCase()

      if(msg == phrase) return true
    }

    if(messageLegal(message.content, cultPhrase) || message.author.id == client.user.id) {
      return
    }

    else message.delete().then(() => {
      if(message.author.bot) {
        return
      }
      
      message.channel.send(`<@${message.author.id}>, saying \`${message.content}\` is a violation of the cult rules.\nYou may only say \`${cultPhrase}\` here.`).then(msg => {
        msg.delete(3000) // delete message in 3 seconds
      }).catch(err => {})
    })
  }
  if(message.channel.id === owsChannelId) {
    function messageLegal(msg) {
      if(!msg) return console.log("error with ows code in message.js event")

      msg = msg.toLowerCase().replace(/[^a-z ]/gi, "")
      
      if(msg.split(" ").length == 1) return true
      else return false

      msg.channel.send("test " + msg.channel.lastMessageId)
    }

    if(messageLegal(message.content) || message.author.id == client.user.id) {
      return
    }

    else message.delete().then(() => {
      if(message.author.bot) {
        return
      }
      
      message.channel.send(`<@${message.author.id}>, this is the one word story channel. You are a stupid.`).then(msg => {
        msg.delete(3000) // delete message in 3 seconds
      }).catch(err => {})
    })
  }
}
