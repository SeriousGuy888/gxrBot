exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const outputEmbed = new Discord.MessageEmbed()
  
  const guild = message.guild
  const allMembers = await guild.members.fetch()
  const authorGuildMember = allMembers.find(gm => gm.id === message.author.id)

    let queryId = authorGuildMember.voice.channelID

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
      let members = Array.from(membersInVc)
      const impostor = members[Math.floor(Math.random() * members.length)]
      
      outputEmbed
        .setColor("#dc1212")
        .setTitle("The Impostor is...")
        .setDescription(impostor.user)
        .setFooter("Reasoning: N/A")
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