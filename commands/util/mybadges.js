exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { getUserArg } = client.functions
  const { messenger, embedder, badger } = client.util


  const user = await getUserArg(message)


  let maxPages

  const badgeEmbed = async (queryPage) => {
    const badges = await badger.getBadges(user.id)

    const itemsPerPage = 5
    const startAt = (queryPage - 1) * itemsPerPage
    const endAt = startAt + itemsPerPage - 1
    maxPages = Math.ceil(badges.length / itemsPerPage)


    const pageEmbed = new Discord.MessageEmbed()
    embedder.addAuthor(pageEmbed, user, "%tag%'s Badges")
      .setDescription(user.id !== message.author.id ? "Wait, not my badges, their badges." : "Description")
      .setColor(config.main.colours.success)
      .setFooter(`Page ${queryPage} of ${maxPages}`)


    for(var i = startAt; i < endAt; i++) {
      const badge = badges[i]
      if(!badge)
        break

      const badgeInfo = config.badges[badge]
      const badgeDesc = badgeInfo?.description || "No description"
      const badgeEmoji = badgeInfo?.emoji + " " || ""

      pageEmbed.addField(`${badgeEmoji}${badge.toUpperCase()}`, badgeDesc)
    }

    return pageEmbed
  }


  const msg = await messenger.loadingMessage(message.channel, {
    colour: config.main.colours.help,
    title: `Getting badges...`
  })

  let page = 1

  const emojis = ["⏪", "◀️", "▶️", "⏩"]
  const emb = await badgeEmbed(page)

  await msg.edit(emb)
  const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)
  msg.createReactionCollector(filter, { time: 30000 })
    .on("collect", async (reaction, reactor) => {
      reaction.users.remove(reactor).catch(() => {})
      switch(reaction.emoji.name) {
        case "⏪":
          page = 1
          break
        case "◀️":
          page--
          break
        case "▶️":
          page++
          break
        case "⏩":
          page = maxPages
          break
      }
      page = Math.max(Math.min(maxPages, page), 1)

      const newEmb = await badgeEmbed(page)
      msg.edit(newEmb)
    })
    .on("exit", collected => {
      msg.edit("No longer collecting reactions.")
    })
  for(const emoji of emojis)
    await msg.react(emoji)
}