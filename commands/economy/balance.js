exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config } = index
  const settings = config.economy.settings
  const { banker, commander, embedder, messenger } = client.util
  
  let user = await commander.getMentionArgs(args[0], 0, message)
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Querying Balance of ${user.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
  embedder.addAuthor(responseEmbed, user, "%tag%'s Balance")

  const balance = await banker.getBalance(user.id)
  responseEmbed.setDescription(`${settings.lang.emojis.coin}${balance.toLocaleString()}\n\n[How does one obtain moolah?](${config.main.links.github_pages}#faq-money)`)

  msg.edit(responseEmbed)
}

exports.cooldown = 10