const index = require("../index.js")
const {
  config,
  client,
  Discord,
  prefix,
  stringSimilarity,
  gameCache
} = index


exports.handle = async (message) => {
  const {
    embedder,
    logger,
    messenger,
    timer,
    guildPreferencer,
    permisser,
    statTracker,
  } = client.util
  const { extractArgs } = this

  if(message.author.bot)
    return


  if(message.content.toLowerCase().indexOf(prefix) === 0) {
    let { args, commandName } = extractArgs(message)
    let command

    if(commandName.length === 0)
      return

    logger.log(`${message.author.tag} (${message.author.id}) executed command in "#${message.channel?.name}" (${message.channel?.id}) of guild "${message.guild?.name ?? "[None]"}" (${message.guild?.id}) with message content "${message.content}"`)

    command = client.commands.get(commandName) //grab cmds from enmap

    if(config.main.commands.blacklistedChannels.includes(message.channel.id)) {
      messenger.dm(message.author.id, `You may not use ${config.main.botNames.lowerCamelCase} commands in that channel!`)
      return
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
      if(command.aliasArgs)
        args = command.aliasArgs
      command = client.commands.get(commandName)
    }
    if(!command) {
      badCommand(false)
      return
    }

    if(config.main.commands.help.flags.includes(args[0]) && command.help)
      command.help(client, message, args)
    else {
      if(!command.run) {
        badCommand(true)
        return
      }
      if(command.disabled) {
        message.channel.send(`This command is disabled for the following reason: \`${command.disabled}\``)
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
              message.channel.send(emb) // send error message
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
            message.channel.send(emb) // send error message
            return // stop
          }
        }

        // sets last used timestamp for the command so command cooldown can be applied again
        client.commandCooldowns[commandName][message.author.id] = new Date()
      }
      command.run(client, message, args)
      statTracker.add(message.author.id, "commands_run", 1)
    }
  }
  else if(gameCache.hangman[message.author.id]) {
    const command = client.commands.get("hangman")
    const args = ["guess"].concat(message.content.split(" "))
    command.run(client, message, args)
  }
  else if(gameCache.minesweeper[message.author.id]) {
    const command = client.commands.get("minesweeper")
    const args = ["cursor"].concat(message.content.split(" "))
    command.run(client, message, args)
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
  
  if(type === 0) { // user mentions
    const userMentionRegex = /^(?:<@!?)?(\d+)(?:>)$/
    if(str.match)
      matches = str.match(userMentionRegex)

    let user
    
    if(!matches)
      return message?.author

    const userId = matches[1]

    if(guildOnly)
      user = (await guild.members.fetch(userId)).user
    else
      user = await client.users.fetch(userId)

    return user || null
  }
  if(type === 1) { // channel mentions
    if(str === ".")
      return message.channel
      
    const channelMentionRegex = /^(?:<#)?(\d+)(?:>)?$/
    matches = str.match(channelMentionRegex)


    if(!matches)
      return null

    let channel
    const channelId = matches[1]

    if(guildOnly)
      channel = await guild.channels.resolve(channelId)
    else
      channel = await client.channels.fetch(channelId)

    return channel || null
  }
  else
    return new Error("Invalid mention arg type!")
}