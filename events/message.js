module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix
  
  const stringSimilarity = index.stringSimilarity

  const messenger = client.util.get("messenger")


  commands: {
    if(message.author.bot)
      break commands

    let args
    let command
    let cmd

    if(message.content.toLowerCase().indexOf(prefix) === 0) {
      args = message.content.slice(prefix.length).trim().split(/ +/g)
      command = args.shift().toLowerCase().trim().slice(0, config.main.maxCommandNameLength)
      if(command.length === 0) break commands

      cmd = client.commands.get(command) //grab cmds from enmap

      if(config.main.commands.blacklistedChannels.includes(message.channel.id)) {
        messenger.dm(client, message.author.id, `You may not use ${config.main.botNames.lowerCamelCase} commands in that channel!`)
        break commands
      }

      
      const badCommand = () => {
        let similarCommandNames = stringSimilarity.findBestMatch(command, client.publicCommandList)
        message.channel.send(`The requested command does not exist or is invalid.\nI have a command registered called \`${similarCommandNames.bestMatch.target}\`. Perhaps you meant to type that?`)
      }


      if(cmd && cmd.alias) cmd = client.commands.get(cmd.alias)
      if(!cmd) {
        badCommand()
        break commands
      }

      if(config.main.commands.help.flags.includes(args[0]) && cmd.help) cmd.help(client, message, args)
      else {
        if(!cmd.run)
          badCommand()
        else
          cmd.run(client, message, args)
      }
    }
    else if(index.gameCache.hangman[message.author.id]) {
      cmd = client.commands.get("hangman")
      args = ["guess"].concat(message.content.split(" "))
      cmd.run(client, message, args)
    }
  }

  autocarrot: {
    if(config.autocarrot.settings.enabled) {
      let pauseAutocarrotCache = index.pauseAutocarrotCache
      
      if(message.content.toLowerCase().includes(config.autocarrot.settings.pause.message)) {
        pauseAutocarrotCache[message.author.id] = {
          issued: new Date()
        }

        message.channel.send(config.autocarrot.settings.pause.response.replace(/%timespan%/gi, config.autocarrot.settings.pause.timespan))
        break autocarrot
      }

      if(message.author.id == client.user.id) break autocarrot
      if(config.autocarrot.settings.exempt.bots && message.author.bot) break autocarrot
      if(config.autocarrot.settings.exempt.webhooks && message.webhookID) break autocarrot
      if(config.autocarrot.settings.exempt.userList.includes(message.author.id)) break autocarrot
      if(config.autocarrot.settings.exempt.channels.includes(message.channel.id)) break autocarrot
      if(pauseAutocarrotCache[message.author.id] && config.autocarrot.settings.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000) break autocarrot

      const autocarrotWebhook = index.autocarrotWebhook
      const swearCensors = config.autocarrot.words

      let needsCorrecting = false
      let diacriticsRemoved = message.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      for(let loopSwear in swearCensors) {
        if(diacriticsRemoved.toLowerCase().match(new RegExp(loopSwear, "gi"))) {
          needsCorrecting = true
          break
        }
      }

      if(needsCorrecting)
        autocarrotWebhook(message.author, message)
    }
  }

  coopChannels: {
    if([config.coopchannels.cult.channel, config.coopchannels.ows.channel].includes(message.channel.id))
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