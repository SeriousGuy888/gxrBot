exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, banker, messenger } = index
  
  let member
  if(!args[0])
    member = message.author
  else
    member = message.mentions.members.first() || await message.guild.members.fetch(args[0])
  if(member.user)
    member = member.user
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    title: `Querying Balance of ${member.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setTitle(`Balance of ${member.tag}`)

  const balance = await banker.getBalance(member.id)
  responseEmbed.setDescription(`:coin: ${balance.toLocaleString()}`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10