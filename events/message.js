module.exports = async (client, message) => {
  const index = require("../index.js")
  const { config, Discord, prefix, timer } = index
  
  const stringSimilarity = index.stringSimilarity

  const messenger = client.util.get("messenger")
  const logger = client.util.get("logger")


  commands: {
    if(message.author.bot)
      break commands

    let args
    let commandName
    let command

    if(message.content.toLowerCase().indexOf(prefix) === 0) {
      args = message.content.slice(prefix.length).trim().split(/ +/g)
      commandName = args.shift().toLowerCase().trim().slice(0, config.main.maxCommandNameLength)
      if(commandName.length === 0) break commands

      command = client.commands.get(commandName) //grab cmds from enmap

      if(config.main.commands.blacklistedChannels.includes(message.channel.id)) {
        messenger.dm(message.author.id, `You may not use ${config.main.botNames.lowerCamelCase} commands in that channel!`)
        break commands
      }

      
      const badCommand = invalid => {
        if(invalid)
          message.channel.send("The requested command failed to run as it is not coded properly.") 
        else {
          let similarCommandNames = stringSimilarity.findBestMatch(commandName, client.publicCommandList)
          message.channel.send(`The requested command does not exist or is invalid.\nI have a command registered called \`${similarCommandNames.bestMatch.target}\`. Perhaps you meant to type that?`)
        }
      }


      if(command && command.alias)
        command = client.commands.get(command.alias)
      if(!command) {
        badCommand(false)
        break commands
      }

      if(config.main.commands.help.flags.includes(args[0]) && command.help)
        command.help(client, message, args)
      else {
        if(!command.run) {
          badCommand(true)
          break commands
        }
        if(command.disabled) {
          message.channel.send(`This command is disabled for the following reason: \`${command.disabled}\``)
          break commands
        }
        if(command.cooldown) {
          const cooldown = command.cooldown * 1000 // convert cooldown from seconds to milliseconds
          if(!client.commandCooldowns[commandName])
            client.commandCooldowns[commandName] = {}
          
          if(client.commandCooldowns[commandName][message.author.id]) {
            const cooldownRemaining = cooldown - (new Date() - client.commandCooldowns[commandName][message.author.id])
            if(cooldownRemaining < cooldown) {
              const timeString = await timer.stringify(cooldownRemaining, { truncZero: true, dropMs: true })
              const emb = new Discord.MessageEmbed()
                .setColor(config.main.colours.error)
                .setTitle(`Command \`${commandName}\` is on cooldown.`)
                .setDescription(`You must wait \`${timeString}\` before using this command again.`)
                .setFooter("Please stop bullying my database.")
              message.channel.send(emb)
              break commands
            }
          }

          client.commandCooldowns[commandName][message.author.id] = new Date()
        }
        command.run(client, message, args)
      }
    }
    else if(index.gameCache.hangman[message.author.id]) {
      command = client.commands.get("hangman")
      args = ["guess"].concat(message.content.split(" "))
      command.run(client, message, args)
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
        logger.log(`${message.author.tag} (ID: ${message.author.id}) has paused autocarrot for ${config.autocarrot.settings.pause.timespan} seconds.`)

        break autocarrot
      }

      if(
        message.author.id == client.user.id ||
        config.autocarrot.settings.exempt.bots && message.author.bot ||
        config.autocarrot.settings.exempt.webhooks && message.webhookID ||
        config.autocarrot.settings.exempt.userList.includes(message.author.id) ||
        config.autocarrot.settings.exempt.channels.includes(message.channel.id) ||
        pauseAutocarrotCache[message.author.id] && config.autocarrot.settings.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000
      )
        break autocarrot

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