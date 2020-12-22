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
        .setDescription(`${impostor.toString().split(",")[1]}`)
        .setFooter("Reasoning: N/A")
      if(!impostor)
        message.channel.send("aaaaaaaaaaa no impostor found dukc this")
    }

  return message.channel.send(outputEmbed)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.help)
    .setTitle("Impostor Help")
    .setDescription("Tells you the impostor.")
    .setFooter("(100% Accurate)")
  return message.channel.send(emb)
}