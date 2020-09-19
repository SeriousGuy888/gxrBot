module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix

  let pauseAutocarrotCache = index.pauseAutocarrotCache

  let args
  let command
  let cmd


  if(message.content.toLowerCase().indexOf(prefix) === 0) {
    if(message.author.bot) return //ignore bots

    args = message.content.slice(prefix.length).trim().split(/ +/g)
    command = args.shift().toLowerCase().trim()

    cmd = client.commands.get(command) //grab cmds from enmap

    if(!cmd) message.channel.send(`\`ERROR\`: Command \`${prefix}${command}\` not found.`)
    else cmd.run(client, message, args)
  }
  
  else if(index.gameCache.hangman[message.author.id]) {
    cmd = client.commands.get("hangman")
    args = ["guess"]
    let msgContent = message.content.split(" ")
    for(let i in msgContent) args.push(msgContent[i])
    cmd.run(client, message, args)
  }


  if(config.autocarrot.settings.enabled) {
    if(message.content.toLowerCase().includes(config.autocarrot.settings.pause.message)) {
      pauseAutocarrotCache[message.author.id] = {
        issued: new Date()
      }

      message.channel.send(`Okay, I will stop autocarroting you for the next ${config.autocarrot.settings.pause.timespan} seconds.`)
      return
    }

    if(message.author.id == client.user.id) return
    if(config.autocarrot.settings.exempt.bots && message.author.bot) return
    if(config.autocarrot.settings.exempt.webhooks && message.webhookID) return
    if(config.autocarrot.settings.exempt.userList.includes(message.author.id)) return
    if(pauseAutocarrotCache[message.author.id] && config.autocarrot.settings.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000) return

    const autocarrotWebhook = index.autocarrotWebhook
    const swearCensors = config.autocarrot.words
    const swearList = Object.keys(swearCensors)

    let needsCorrecting = false
    for(let i in swearList) {
      if(message.content.toLowerCase().includes(swearList[i])) {
        needsCorrecting = true
      }
    }

    if(needsCorrecting) {
      autocarrotWebhook(message.author, message.channel, message.content)
      if(config.autocarrot.settings.deleteOriginalMessage) {
        message.delete()
      }
    }
  }


  if([config.coopchannels.cult.channel, config.coopchannels.ows.channel].includes(message.channel.id)) {
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

  if(config.autoResponses.enabled) index.autoResponses(message)
}