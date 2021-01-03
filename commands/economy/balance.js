exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, banker, messenger } = index
  const settings = config.economy
  
  let member
  if(!args[0])
    member = message.author
  else
    member = message.mentions.members.first() || await message.guild.members.fetch(args[0])
  if(member.user)
    member = member.user
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Querying Balance of ${member.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setTitle(`Balance of ${member.tag}`)

  const balance = await banker.getBalance(member.id)
  responseEmbed.setDescription(`${settings.lang.emojis.coin}${balance.toLocaleString()}`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10