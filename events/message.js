module.exports = async (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix

  let cultCache = index.cultCache
  let cultChannelId = cultCache.id.slice(2, cultCache.id.length - 1) // remove <# and > from channel mention to get id
  let cultPhrase = cultCache.word

  let owsCache = index.owsCache
  let owsChannelId = owsCache.id.slice(2, owsCache.id.length - 1) // remove <# and > from channel mention to get id

  let pauseAutocarrotCache = index.pauseAutocarrotCache

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
  
  else if(index.gameCache.hangman[message.author.id]) {
    cmd = client.commands.get("hangman")
    args = ["guess"]
    let msgContent = message.content.split(" ")
    for(let i in msgContent) args.push(msgContent[i])
    cmd.run(client, message, args)
  }


  if(config.autocarrot.enabled) {
    if(message.content.toLowerCase().includes(config.autocarrot.pause.message)) {
      pauseAutocarrotCache[message.author.id] = {
        issued: new Date()
      }

      message.channel.send(`Okay, I will stop autocarroting you for the next ${config.autocarrot.pause.timespan} seconds.`)
      return
    }

    if(message.author.id == client.user.id) return
    if(config.autocarrot.exempt.bots && message.author.bot) return
    if(config.autocarrot.exempt.webhooks && message.webhookID) return
    if(config.autocarrot.exempt.userList.includes(message.author.id)) return
    if(pauseAutocarrotCache[message.author.id] && config.autocarrot.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000) return

    const autocarrotWebhook = index.autocarrotWebhook
    const swearCensors = require("../data/autocarrot/censored_words.json")
    const swearList = Object.keys(swearCensors)

    let needsCorrecting = false
    for(let i in swearList) {
      if(message.content.toLowerCase().includes(swearList[i])) {
        needsCorrecting = true
      }
    }

    if(needsCorrecting) {
      autocarrotWebhook(message.author, message.channel, message.content)
      if(config.autocarrot.deleteOriginalMessage) {
        message.delete()
      }
    }
  }


  if([cultChannelId, owsChannelId].includes(message.channel.id)) {
    const cultLegal = (content, phrase) => {
      if(!content || !phrase) return console.log("error with cult code in message.js event")
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
        msg.channel.send(errorMessage).then(m => m.delete(3000)).catch(err => {})
      })
    }

    if(message.author.id == client.user.id) return
    switch(message.channel.id) {
      case cultChannelId:
        if(cultLegal(message.content, cultPhrase)) return
        else deleteMessage(message, `<@${message.author.id}>, saying \`${message.content}\` is a violation of the cult rules.\nYou may only say \`${cultPhrase}\` here.`)
        break
      case owsChannelId:
        if(owsLegal(message.content)) return
        else deleteMessage(message, `<@${message.author.id}>, this is the one word story channel. You are a stupid.`)
        break
    }
  }

  if(config.autoActions.enabled) {
    const literalIdPrefix = config.autoActions.literalIdPrefix
    const emojiKey = config.autoActions.emojiKey
    const channelData = config.autoActions.channels
    const channelList = Object.keys(channelData)

    if(!channelList.includes(message.channel.id)) return
    if(!channelData[message.channel.id].enabled) return

    const reactionList = channelData[message.channel.id].reactions
    const messageList = channelData[message.channel.id].messages

    if(messageList) {
      for(let loopMessage of messageList) {
        message.channel.send(loopMessage.content, { embed: loopMessage.embed ? loopMessage.embed : null }).then(msg => {
          if(loopMessage.options.autoDelete.enabled) {
            let timeout = loopMessage.options.autoDelete.timeout
            timeout = Math.min(Math.max(timeout, 1), 60 * 1000) // clamp timeout between 1ms and 1min
            msg.delete(timeout)
          }
        })
      }
    }
    if(reactionList) {
      let reactionEmojis = []
  
      for(let i in reactionList) {
        if(reactionList[i].startsWith(literalIdPrefix)) {
          let emojiStr = reactionList[i].slice(literalIdPrefix.length)
          if(!emojiStr) return console.log(`Emoji \`${reactionList[i]}\` invalid; skipping...`)
          reactionEmojis.push(emojiStr)
        }
        else {
          if(!emojiKey[reactionList[i]]) console.log(`Autoreaction emoji key ${reactionList[i]} not found. Skipping emoji...`)
          else reactionEmojis.push(emojiKey[reactionList[i]])
        }
      }
  
      for(let loopEmoji of reactionEmojis) {
        try { await message.react(loopEmoji) }
        catch(error) { console.error(`Failed to add reaction ${loopEmoji} to message ${message.id} due to error \`${error}\``) }
      }
    }
  }
}
