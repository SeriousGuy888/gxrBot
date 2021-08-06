exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { commander, embedder, permisser } = client.util

  if(!message.guild || !args[0])
    return this.help(client, message, args)

  
  const guild = message.guild
  const allMembers = await guild.members.fetch()


  if(!await permisser.permissionEmbed(message.member, ["MUTE_MEMBERS"], false, message.channel))
    return

  const outputEmbed = new Discord.MessageEmbed()

  const vc = await commander.getMentionArgs(args[0], 2, message, true)
  if(!vc) return message.channel.send("Specified channel ID is not of a voice channel in this guild.")
  
  const membersInVc = allMembers.filter(gm => gm.voice.channelID && gm.voice.channelID === vc.id)
  if(Array.from(membersInVc).length === 0) {
    outputEmbed
      .setColor(config.main.colours.error)
      .setTitle("Specified Voice Channel Empty")
      .setDescription(`The VC ${vc} is currently empty.`)
    embedder.addAuthor(outputEmbed, message.author)
  }
  else {
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
    embedder.addAuthor(outputEmbed, message.author)
  }

  return message.channel.send(outputEmbed)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, commandHelpEmbed } = index

  const emb = commandHelpEmbed(message, {
    title: "Mute",
    description: "Mutes or unmutes all users in a specified VC.",
    syntax: `${config.main.prefix}mute <ID | .> [u]`,
    example: [
      "**__By Channel ID__**",
      `**Mute:** ${config.main.prefix}mute 430565803293933582`,
      `**Unmute:** ${config.main.prefix}mute 430565803293933582 u`,
      "",
      "**__The VC you are in__**",
      `**Mute:** ${config.main.prefix}mute .`,
      `**Unmute:** ${config.main.prefix}mute . u`
    ].join("\n")
  })
    .setFooter("This command can only be used in a guild and not a DM.")

  return message.channel.send(emb)
}

exports.disabled = "temp disabled during discord.js v13 update"