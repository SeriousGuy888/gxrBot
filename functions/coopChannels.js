exports.run = (client, message) => {
  const index = require("../index.js")
  const config = index.config

  const notRepeat = channel => {
    channel.messages.fetch({ limit: 2 }).then(res => {
      const fetchedMessages = res.array()
      if(fetchedMessages[0].author.id === fetchedMessages[1].author.id)
        return false
      return true
    })
  }

  const cultLegal = (content, phrase) => {
    content = content.toLowerCase()
    phrase = phrase.toLowerCase()
    if(content == phrase) return true
  }
  const owsLegal = content => {
    content = content.toLowerCase().replace(/[^a-z ]/gi, "")
    return content.split(" ").length == 1 && notRepeat(message.channel)
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