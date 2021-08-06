exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config } = index
  const { getUserArg, getEasterLink } = client.functions
  const { karmanator, messenger } = client.util

  const settings = config.karma


  let user = await getUserArg(message)
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.karma,
    title: `Querying Karma of ${user.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setThumbnail(user.avatarURL({ dynamic: true }))
    .setTitle(`${user.tag}'s Karma`)
    .setURL(getEasterLink())
    .setFooter(settings.lang.footer)


  const karma = await karmanator.get(user.id) ?? 0
    
  const { positive, negative } = settings.leaderboard.emojis
  responseEmbed.setDescription([
    `[What is karma?](${config.main.links.github_pages}#faq-karma)`,
    `${karma > 0 ? positive : negative} ${karma.toLocaleString()}`,
    "",
    config.main.guild.id !== message.guild.id ? settings.lang.unavailableInGuild : ""
  ].join("\n"))

  msg.edit({ embeds: [responseEmbed] })
}