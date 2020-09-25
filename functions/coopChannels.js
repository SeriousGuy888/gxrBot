exports.run = (client, message) => {
  const index = require("../index.js")
  const config = index.config

  const cultLegal = (content, phrase) => {
    if(!content || !phrase) return console.log("Cult message validation failed due to missing arguments in message.js")
    content = content.toLowerCase()
    phrase = phrase.toLowerCase()
    if(content == phrase) return true
  }
  const owsLegal = content => {
    if(!content) return console.log("error with ows code in message.js event")
    content = content.toLowerCase().replace(/[^a-z ]/gi, "")
    return content.split(" ").length == 1
  }
  const deleteMessage = (msg, errorMessage) => {
    msg.delete().then(() => {
      if(msg.author.bot) return
      msg.channel.send(errorMessage).then(m => m.delete({ timeout: 3000 })).catch(err => {})
    })
  }

  if(message.author.id == client.user.id) return
  if(message.channel.id == config.coopchannels.cult.channel) {
    if(cultLegal(message.content, config.coopchannels.cult.phrase)) return
    deleteMessage(message, `<@${message.author.id}>, saying \`${message.content}\` is a violation of the cult rules.\nYou may only say \`${config.coopchannels.cult.phrase}\` here.`)
  }
  else if(message.channel.id == config.coopchannels.ows.channel) {
    if(owsLegal(message.content)) return
    deleteMessage(message, `<@${message.author.id}>, this is the one word story channel. You are a stupid.`)
  }
}