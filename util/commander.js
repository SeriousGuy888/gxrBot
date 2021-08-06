const index = require("../index.js")
const {
  config,
  client,
  Discord,
  prefix,
} = index
const { didYouMean } = client.functions


exports.handle = async (message) => {
  const { embedder, logger, messenger, timer, guildPreferencer, permisser, statTracker, gamer } = client.util
  const { badCommand, extractArgs } = this

  if(message.author.bot)
    return


  if(message.content.toLowerCase().indexOf(prefix) === 0) {
    let { args, commandName } = extractArgs(message)
    let command

    if(commandName.length === 0)
      return

    // logger.log(`${message.author.tag} (${message.author.id}) executed command in "#${message.channel?.name}" (${message.channel?.id}) of guild "${message.guild?.name ?? "[None]"}" (${message.guild?.id}) with message content "${message.content}"`)

    command = client.commands.get(commandName) //grab cmds from enmap

    if(config.main.commands.blacklistedChannels.includes(message.channel.id)) {
      messenger.dm(message.author.id, `You may not use ${config.main.botNames.lowerCamelCase} commands in that channel!`)
      return
    }


    if(command && command.alias) {
      commandName = command.alias
      if(command.aliasArgs)
        args = command.aliasArgs
      command = client.commands.get(commandName)
    }
    if(!command) {
      badCommand(false, message, commandName)
      return
    }

    if(config.main.commands.help.flags.includes(args[0]) && command.help)
      command.help(client, message, args)
    else {
      if(command.disabled) {
        message.reply({ content: `This command is disabled for the following reason: \`${command.disabled}\`` })
        return
      }
      if(command.moved) {
        const emb = new Discord.MessageEmbed()
          .setColor(config.main.colours.error)
          .setTitle(`Moved to \`/${command.moved}\``)
          .setDescription(`Discord is being a poopyhead and trying to get bots to use slash commands that are better in every way or something like that. This command has been moved to the slash command \`/${command.moved}\`.`)
        message.reply({ embeds: [emb] })
        return
      }
      if(message.guild) {
        const prefs = await guildPreferencer.get(message.guild.id)
        const adminBypass = prefs.admins_bypass_disabled_commands

        if(prefs.disabled_commands) {
          const disabledCommands = prefs.disabled_commands
            .split(",")
            .map(e => e.trim().toLowerCase())
          
          if(disabledCommands.includes(commandName)) { // command is disabled
            if(
              !permisser.hasPermission(message.member, ["ADMINISTRATOR", "MANAGE_GUILD"]) || // member is not admin or
              !adminBypass // admins cannot bypass disabled commands
            ) {
              const emb = new Discord.MessageEmbed()
              embedder.addAuthor(emb, message.author)
                .setColor(config.main.colours.error)
                .setTitle(`Command \`${commandName}\` is disabled in this server.`)
                .setDescription(`Ask an admin to reenable this command if you want to use it. ${adminBypass ? "Admins are allowed to bypass this." : ""}`)
                .setFooter(`${prefix}config is the command to do so`)
              message.reply({ embeds: [emb] }) // send error message
              return
            }
          }
        }
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
            embedder.addAuthor(emb, message.author)
              .setColor(config.main.colours.error)
              .setTitle(`Command \`${commandName}\` is on cooldown.`)
              .setDescription(`You must wait \`${timeString}\` before using this command again.`)
              .setFooter("Please stop bullying my database.")
            message.reply({ embeds: [emb] }) // send error message
            return // stop
          }
        }

        // sets last used timestamp for the command so command cooldown can be applied again
        client.commandCooldowns[commandName][message.author.id] = new Date()
      }
      if(!command.run) {
        badCommand(true, message, commandName)
        return
      }
      command.run(client, message, args)
      statTracker.add(message.author.id, "commands_run", 1)
    }
  }
  else if(gamer.isPlaying(message.author.id)) {
    if(config.main.commands.blacklistedChannels.includes(message.channel.id)) {
      return
    }

    if(gamer.isPlaying(message.author.id, "hangman")) {
      const command = client.commands.get("hangman")
      const args = ["guess"].concat(message.content.split(" "))
      command.run(client, message, args)
    }
    if(gamer.isPlaying(message.author.id, "minesweeper")) {
      const command = client.commands.get("minesweeper")
      const args = ["cursor"].concat(message.content.split(" "))
      command.run(client, message, args)
    }
    if(gamer.isPlaying(message.author.id, "chess")) {
      if(gamer.getPlayerData(message.author.id).data.message.channel.id === message.channel.id) {
        const command = client.commands.get("chess")
        const args = ["move"].concat(message.content.split(" "))
        command.run(client, message, args)
      }
    }
  }
}


exports.badCommand = (invalidCommand, message, commandName) => {
  const { embedder } = client.util

  if(invalidCommand) message.reply({ content: "The requested command exists but failed to run D:" }) 
  else {
    const allCommandSimilarities = didYouMean(commandName, client.publicCommandList)

    const topCommands = []
    for(let i = 0; i < 5; i++) {
      topCommands.push(allCommandSimilarities[i].target)
    }


    const commandSuggestionsStr = "```\n" + topCommands.map(e => `- ${e}`).join("\n") + "```"

    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setColor(config.main.colours.error)
      .setTitle("Invalid Command")
      .setDescription(`Did you mean one of these commands?\n${commandSuggestionsStr}`.slice(0, 2048))
      .setFooter(`${prefix}help to see list of commands.`)
    message.reply({ embeds: [emb] })
  }
}


exports.extractArgs = (message) => {
  const args = message
    .content // message content
    .slice(prefix.length) // remove prefix
    .trim() // remove leading and trailing whitespace
    .split(/ +/g) // split at any space or multiple spaces
  const commandName = args
    .shift() // remove first argument and use as command name
    .toLowerCase() // lowercase command name
    .trim() // remove whitespace
    .slice(0, config.main.maxCommandNameLength) // cap command name length
  
  return {
    args,
    commandName,
  }
}

exports.getMentionArgs = async (str, type, message, guildOnly) => {
  const { guild } = message
  if(!str)
    str = "."

  let matches = []
  
  switch(type) {
    case 0: // user mentions
      const userMentionRegex = /^(?:<@!?)?(\d+)(?:>)?$/
      if(str.match) {
        matches = str.match(userMentionRegex)
      }
  
      let user
      
      if(!matches)
        return message?.author
  
      const userId = matches[1]
  
      if(guildOnly)
        user = (await guild.members.fetch(userId))?.user
      else
        user = await client.users.fetch(userId)
  
      return user || message.author
    case 1: // channel mentions
      if(str === ".") {
        return message.channel
      }
        
      const channelMentionRegex = /^(?:<#)?(\d+)(?:>)?$/
      matches = str.match(channelMentionRegex)
  
      if(!matches) return null
  
      let channel
      const channelId = matches[1]
  
      if(guildOnly) channel = await guild.channels.resolve(channelId)
      else          channel = await client.channels.fetch(channelId)
  
      return channel || null
    case 2: // voice channels
      let voiceId = str
      if(str === ".") {
        if(!message.member.voice.channelID)
          return null
        voiceId = message.member.voice.channelID
      }

      const vc = message.guild.channels.resolve(voiceId)
      if(!vc || vc.type !== "voice") {
        return null
      }

      return vc
    default:
      return new Error("Invalid mention arg type!")
  }
}