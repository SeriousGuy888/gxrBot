exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { commander, badger, embedder, messenger } = client.util


  const user = await commander.getMentionArgs(args[0], 0, message)


  const badges = await badger.getBadges(user.id)

  const embed = new Discord.MessageEmbed()
  embedder.addAuthor(embed, user, "%tag%'s Badges")
    .setTitle("User Badges")
    .setColor(config.main.colours.success)

  badger.paginateBadges(message, embed, badges, 1)
}