module.exports = async (client, message) => {
  const index = require("../index.js")
  const { config } = index
  const {
    commander,
    logger,
    guildPreferencer,
  } = client.util
  const { autocarrot } = client.functions


  commander.handle(message)

  
  autocarrot: {
    if(
      config.autocarrot.settings.enabled && // bot config has enabled autocarrot
      message.guild && // message was sent in a guild
      (await guildPreferencer.get(message.guild.id)).autocarrot_enabled // guild has autocarrot enabled
    ) {
      let pauseAutocarrotCache = index.pauseAutocarrotCache
      
      if(message.content.toLowerCase().includes(config.autocarrot.settings.pause.message)) {
        pauseAutocarrotCache[message.author.id] = {
          issued: new Date()
        }
        message.channel.send(config.autocarrot.settings.pause.response.replace(/%timespan%/gi, config.autocarrot.settings.pause.timespan))
        logger.log(`${message.author.tag} (ID: ${message.author.id}) has paused autocarrot for ${config.autocarrot.settings.pause.timespan} seconds.`)

        break autocarrot
      }

      if( // don't autocarrot if
        message.author.id == client.user.id || // is client
        config.autocarrot.settings.exempt.bots && message.author.bot || // bots are exempted and user is bot
        config.autocarrot.settings.exempt.webhooks && message.webhookId || // webhooks are exempted and author is webhook
        config.autocarrot.settings.exempt.userList.includes(message.author.id) || // user is exempted
        config.autocarrot.settings.exempt.channels.includes(message.channel.id) || // channel is exempted
        pauseAutocarrotCache[message.author.id] && config.autocarrot.settings.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000 // user has paused autocarrot
      )
        break autocarrot

      const swearCensors = config.autocarrot.words

      let needsCorrecting = false
      let diacriticsRemoved = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      for(let loopSwear in swearCensors) {
        if(diacriticsRemoved.toLowerCase().match(new RegExp(loopSwear, "gi"))) {
          needsCorrecting = true
          break
        }
      }

      if(needsCorrecting) autocarrot(message.author, message)
    }
  }

  coopChannels: {
    if([config.coopchannels.cult.channel, config.coopchannels.ows.channel, config.coopchannels.counting.channel].includes(message.channel.id))
      index.coopChannels(message)
  }
  
  autoResponses: {
    if(config.autoResponses.settings.enabled)
      index.autoResponses(message)
  }
  
  messageResponder: {
    if(message.author.bot)
      break messageResponder
    index.messageResponder(message)
  }
}