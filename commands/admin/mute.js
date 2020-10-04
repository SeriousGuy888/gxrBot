exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!message.guild || !args[0]) return this.help(client, message, args)

  const outputEmbed = new Discord.MessageEmbed()
  
  const guild = message.guild
  const allMembers = await guild.members.fetch()
  const authorGuildMember = allMembers.find(gm => gm.id === message.author.id)

  if(!authorGuildMember.hasPermission(Discord.Permissions.FLAGS.MUTE_MEMBERS)) {
    outputEmbed
      .setColor(config.mute.colours.failure)
      .setTitle("Insufficient Permissions")
      .setDescription("You may not use this command as you do not have the permission `MUTE_MEMBERS`.")
      .setFooter("Is this a mistake? Contact server admins.")
  }
  else {
    const vc = guild.channels.resolve(args[0])
    if(!vc || vc.type !== "voice") return message.channel.send("Specified channel ID is not of a voice channel in this guild.")
    
    const membersInVc = allMembers.filter(gm => gm.voice.channelID && gm.voice.channelID === vc.id)
    if(Array.from(membersInVc).length === 0) {
      outputEmbed
        .setColor(config.mute.colours.failure)
        .setTitle("Specified Voice Channel Empty")
        .setDescription(`The VC ${vc} is currently empty.`)
    }
    else {
      const isUnmuting = args[1] && args[1].startsWith("u")
      const startTime = new Date()

      let membersMutedCount = 0
      for(let loopMember of membersInVc) {
        const guildMember = allMembers.find(gm => gm.id === loopMember[0])
        guildMember.voice.setMute(!isUnmuting, `${isUnmuting ? "Unmute" : "Mute"} all users in VC ${vc} by ${message.author.tag}`)
        membersMutedCount++
      }

      const endTime = new Date()
      const timeDiff = (endTime.getTime() - startTime.getTime()) / 1000
  
      const completedAction = isUnmuting ? "Unmuted" : "Muted"
      outputEmbed
        .setColor(isUnmuting ? config.mute.colours.unmute : config.mute.colours.mute)
        .setTitle(`${completedAction} All Users in VC`)
        .setDescription(isUnmuting ? "To mute again, omit the final argument." : "To unmute, add `u` to the end of the command.")
        .addField(`Members ${completedAction}`, membersMutedCount, true)
        .addField(`Time Taken`, timeDiff, true)
        .setFooter("Warning: this only affects people in the VC when the command is executed.")
    }
  }

  return message.channel.send(outputEmbed)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const emb = new Discord.MessageEmbed()
    .setColor(config.mute.colours.help)
    .setTitle("Mute Help")
    .setDescription("Mutes or unmutes all users in a specified VC.")
    .addField("Syntax", `${config.main.prefix}mute <Channel ID> [u]`)
    .addField("Examples", `**Mute:** ${config.main.prefix}mute 424242\n**Unmute:** ${config.main.prefix}mute 666666 u`)
    .setFooter("This command can only be used in a guild and not a DM.")
  return message.channel.send(emb)
}