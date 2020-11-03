module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix
  
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

      
      if(cmd && cmd.alias) cmd = client.commands.get(cmd.alias)
      if(!cmd) {
        message.channel.send(`The command \`${command}\` (or the command it points to) does not exist.`)
        break commands
      }

      if(config.main.help.flags.includes(args[0]) && cmd.help) cmd.help(client, message, args)
      else {
        if(!cmd.run)
          message.channel.send(`The command you requested or the command it points to does not have a defined \`run\` function.`)
        else cmd.run(client, message, args)
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

        message.channel.send(`Okay, I will stop autocarroting you for the next ${config.autocarrot.settings.pause.timespan} seconds.`)
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
      for(let loopSwear in swearCensors) {
        if(message.content.toLowerCase().match(new RegExp(loopSwear, "gi"))) {
          needsCorrecting = true
          break
        }
      }

      if(needsCorrecting) {
        autocarrotWebhook(message.author, message)
        if(config.autocarrot.settings.deleteOriginalMessage) {
          // for(let loopAttachment of message.attachments)
          message.channel.send(JSON.stringify(message.attachments.array()))
          message.delete()
        }
      }
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
  
  pog: {
    if(message.author.bot) break pog
    index.pog(message)
  }
}