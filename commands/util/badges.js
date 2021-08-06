exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { badger, embedder } = client.util

  const badgeData = badger.badgeData()

  if(!args[0]) {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.help)
      .setTitle("All Badges")
      .setDescription([
        "Here is a list of every available badge.",
        "Use command `badges <badge id>` to see a specific badge.",
        "Use command `mybadges` to see what badges you have.",
        "",
        `[What are badges?](${config.main.links.github_pages}#faq-badges)\n\n`
      ].join("\n"))

    await badger.paginateBadges(message, emb, Object.keys(badgeData), 1)
  }
  else {
    const badgeName = args[0].toLowerCase()
    const badge = badgeData[badgeName]

    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(badgeName.toUpperCase())
      .setFooter("Use command `mybadges` to see what badges you have.")

    if(!badge) {
      emb.setDescription("Not found. Are you sure you didn't mean to use the `mybadges` command?")
    }
    else {
      emb
        .setTitle((badge.emoji ? badge.emoji + " " : "") + badgeName.toUpperCase())
        .setDescription(badge.description || "No description provided.")
    }

    message.reply({ embeds: [emb] })
  }
}