module.exports = async (client, message) => {
  const index = require("../index.js")
  const {
    config,
    Discord,
    prefix,
    stringSimilarity,
    extractArgs,
  } = index
  const {
    logger,
    messenger,
    timer,
    guildPreferencer,
  } = client.util


  commands: {
    if(message.author.bot)
      break commands

    if(message.content.toLowerCase().indexOf(prefix) === 0) {
      let { args, commandName } = extractArgs(message)
      let command

      if(commandName.length === 0)
        break commands

      logger.log(`${message.author.tag} (${message.author.id}) executed command in "#${message.channel?.name}" (${message.channel?.id}) of guild "${message.guild?.name ?? "[None]"}" (${message.guild?.id}) with message content "${message.content}"`)

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
          message.channel.send(`The requested command does not exist or is invalid.\nI have a command registered called \`${similarCommandNames.bestMatch.target}\`. Perhaps you meant to type that?\n\nIf not, try using the command \`${prefix}help\`.`)
        }
      }


      if(command && command.alias) {
        commandName = command.alias
        command = client.commands.get(commandName)
      }
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
          if(!client.commandCooldowns[commandName]) // if this command does not have a cooldown object
            client.commandCooldowns[commandName] = {} // create one
          
          if(client.commandCooldowns[commandName][message.author.id]) { // if user has a last used timestamp for this command
            const timeSinceLastUse = Date.now() - client.commandCooldowns[commandName][message.author.id] // calculate time since last use
            if(timeSinceLastUse < cooldown) { // cooldown has not been completed
              const timeString = await timer.stringify(cooldown - timeSinceLastUse, { truncZero: true, dropMs: true }) // get str for time left in cooldown
              const emb = new Discord.MessageEmbed()
                .setColor(config.main.colours.error)
                .setTitle(`Command \`${commandName}\` is on cooldown.`)
                .setDescription(`You must wait \`${timeString}\` before using this command again.`)
                .setFooter("Please stop bullying my database.")
              message.channel.send(emb) // send error message
              break commands // stop
            }
          }

          // sets last used timestamp for the command so command cooldown can be applied again
          client.commandCooldowns[commandName][message.author.id] = new Date()
        }
        command.run(client, message, args)
      }
    }
    else if(index.gameCache.hangman[message.author.id]) {
      const command = client.commands.get("hangman")
      const args = ["guess"].concat(message.content.split(" "))
      command.run(client, message, args)
    }
    else if(index.gameCache.minesweeper[message.author.id]) {
      const command = client.commands.get("minesweeper")
      const args = ["cursor"].concat(message.content.split(" "))
      command.run(client, message, args)
    }
  }

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
        config.autocarrot.settings.exempt.webhooks && message.webhookID || // webhooks are exempted and author is webhook
        config.autocarrot.settings.exempt.userList.includes(message.author.id) || // user is exempted
        config.autocarrot.settings.exempt.channels.includes(message.channel.id) || // channel is exempted
        pauseAutocarrotCache[message.author.id] && config.autocarrot.settings.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000 // user has paused autocarrot
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