exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { badger, embedder } = client.util

  const badgeData = badger.badgeData()

  if(!args[0]) {
    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setColor(config.main.colours.help)
      .setTitle("All Badges")
      .setFooter("Use command `badges <badge id>` for a detailed description. Use command `prof` to see what badges you have.")

    let description = `[What are badges?](${config.main.links.github_pages}#faq-badges)\n\n`
    for(const i in badgeData) {
      let name = ""
      if(badgeData[i].emoji)
        name += badgeData[i].emoji + " "
      name += `**${i.toUpperCase()}**\n`

      description += name
    }

    emb.setDescription(description)


    message.channel.send(emb)
  }
  else {
    const badgeName = args[0].toLowerCase()
    const badge = badgeData[badgeName]

    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setColor(config.main.colours.success)
      .setTitle(badgeName.toUpperCase())
      .setFooter("Use command `prof` to see what badges you have.")

    if(!badge) {
      emb.setDescription("Not found.")
    }
    else {
      emb
        .setTitle((badge.emoji ? badge.emoji + " " : "") + badgeName.toUpperCase())
        .setDescription(badge.description || "No description provided.")
    }

    message.channel.send(emb)
  }
}