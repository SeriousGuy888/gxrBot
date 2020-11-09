exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(config.admins.superadmin.id !== message.author.id)
    return message.channel.send("this thing is ducking broken")

  if(!message.guild || !args[0]) return this.help(client, message, args)

  const outputEmbed = new Discord.MessageEmbed()

  message.channel.send("1")
  
  const guild = message.guild
  const allMembers = await guild.members.fetch()

  // guild.members.fetch()
  //   .then(allMembers => {
  //     message.channel.send("a")
  //   })
  //   .catch(err => {
  //     message.channel.send(err)
  //   })

  // return

  const authorGuildMember = allMembers.find(gm => gm.id === message.author.id)

  message.channel.send("2")

  if(!authorGuildMember.hasPermission(Discord.Permissions.FLAGS.MUTE_MEMBERS)) {
    outputEmbed
      .setColor(config.main.colours.error)
      .setTitle("Insufficient Permissions")
      .setDescription("You may not use this command as you do not have the permission `MUTE_MEMBERS`.")
      .setFooter("Is this a mistake? Contact server admins.")
  }
  else {
    message.channel.send("3")

    let queryId = args[0]
    if(args[0] === ".") {
      if(!authorGuildMember.voice.channelID)
        return message.channel.send("You are not in a VC!")
      queryId = authorGuildMember.voice.channelID
    }

    const vc = guild.channels.resolve(queryId)
    if(!vc || vc.type !== "voice")
      return message.channel.send("Specified channel ID is not of a voice channel in this guild.")
    
    const membersInVc = allMembers.filter(gm => gm.voice.channelID && gm.voice.channelID === vc.id)
    if(Array.from(membersInVc).length === 0) {
      outputEmbed
        .setColor(config.main.colours.error)
        .setTitle("Specified Voice Channel Empty")
        .setDescription(`The VC ${vc} is currently empty.`)
    }
    else {
      message.channel.send("2")

      const isUnmuting = args[1] && args[1].toLowerCase().startsWith("u")
      const startTime = new Date()

      const delay = ms => new Promise(res => setTimeout(res, ms))

      let membersMutedCount = 0
      for(let loopMember of membersInVc) {
        const guildMember = allMembers.find(gm => gm.id === loopMember[0])
        if(!isUnmuting !== guildMember.voice.serverMute) {
          const reason = `${isUnmuting ? "Unmute" : "Mute"} all users in VC ${vc} by ${message.author.tag}`
          guildMember.voice.setMute(!isUnmuting, reason)
          membersMutedCount++
          await delay(config.mute.perMemberDelay)
        }
      }

      const endTime = new Date()
      const timeDiff = (endTime.getTime() - startTime.getTime())
  
      const completedAction = isUnmuting ? "Unmuted" : "Muted"
      outputEmbed
        .setColor(isUnmuting ? config.mute.colours.unmute : config.mute.colours.mute)
        .setTitle(`${completedAction} All Users in \`${vc.name}\``)
        .setDescription(isUnmuting ? "To mute again, omit the final argument." : "To unmute, add `u` to the end of the command.")
        .addField(`Members ${completedAction}`, membersMutedCount, true)
        .addField(`Time Taken`, `${timeDiff} ms`, true)
        .setFooter("Warning: Command is often rate limited. Not much I can do about it. -billzo")
    }
  }

  return message.channel.send(outputEmbed)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.help)
    .setTitle("Mute Help")
    .setDescription("Mutes or unmutes all users in a specified VC.")
    .addField("Syntax", `${config.main.prefix}mute <ID | .> [u]`)
    .addField("Examples", [
      "**__By Channel ID__**",
      `**Mute:** ${config.main.prefix}mute 430565803293933582`,
      `**Unmute:** ${config.main.prefix}mute 430565803293933582 u`,
      "",
      "**__The VC you are in__**",
      `**Mute:** ${config.main.prefix}mute .`,
      `**Unmute:** ${config.main.prefix}mute . u`
    ].join("\n"))
    .setFooter("This command can only be used in a guild and not a DM.")
  return message.channel.send(emb)
}