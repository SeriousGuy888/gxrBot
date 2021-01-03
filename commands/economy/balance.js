exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, getUserArg, banker, messenger } = index
  const settings = config.economy
  
  let user = await getUserArg(message)
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Querying Balance of ${user.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Balance of ${user.tag}`)

  const balance = await banker.getBalance(user.id)
  responseEmbed.setDescription(`${settings.lang.emojis.coin}${balance.toLocaleString()}`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10