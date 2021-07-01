exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, karmaQueue } = index
  let { karmaLeaderboardCache } = index
  const { embedder, karmanator, messenger } = client.util

  const settings = config.karma
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.karma,
    title: "Getting Leaderboard Data..."
  })




  const { positive, negative } = settings.leaderboard.emojis

  let description = [
    `Have people to your messages with ${positive} or ${negative} to affect your ~~popularity~~ karma score!`,
    "",
    `[Leaderboard on Web Panel](${settings.lang.web_panel.leaderboard})`,
    `[What is karma?](${config.main.links.github_pages}#faq-karma)`,
    config.main.guild.id !== message.guild.id ? settings.lang.unavailableInGuild : "",
    "\u200b"
  ]

  const leaderboardEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setTitle("Discord Karma Leaderboard")
    .setDescription(description.join("\n"))
    .setFooter(settings.lang.footer)
  embedder.addAuthor(leaderboardEmbed, message.author)


  if(karmaLeaderboardCache.length === 0) {
    karmaLeaderboardCache = await karmanator.getTop(settings.leaderboard.top.total)
  }

  const getRankingStr = (rank, isAuthor) => {
    // this function will give medal emojis for the first 3
    // it will return a star if the user is not in the top 3 for the user's entry
    // otherwise, it will just return #rank
    switch(rank) {
      case 1:
        return ":first_place: First Place"
      case 2:
        return ":second_place: Second Place"
      case 3:
        return ":third_place: Third Place"
      default:
        if(isAuthor)
          return `:star: #${rank.toString().padStart(2, "0")}`
        else
          return `#${rank.toString().padStart(2, "0")}`
    }
  }

  for(let i in karmaLeaderboardCache) {
    let field = karmaLeaderboardCache[i]

    if(i == settings.leaderboard.top.total) {
      // leaderboardEmbed.addField("*More Leaderboard Entries...*", `The DiscordAPI limits the amount of fields I can display in this embed.\nOnly the top ${settings.leaderboard.top.total} users are displayed here.\n\nIf you wish to see more users, you can visit the [web panel](${settings.lang.web_panel.leaderboard}) for more entries past the top ${settings.leaderboard.top.total}.\n\u200b\n\u200b`)
      continue
    }

    let rank = parseInt(i) + 1
    let rankingStr = getRankingStr(rank, field.id === message.author.id)

    let karma = field.karma
    let emoji = karma > 0 ? positive : negative
    let content = `${emoji} [${karma.toLocaleString()}](https://youtu.be/Wu8mhzQe5tM")`

    if(karmaQueue[field.id])
      content += ` and ${karmaQueue[field.id]} pending`
    leaderboardEmbed.addField(`${rankingStr}`, `${field.user}\n${content}` + "\n\u200b", true)
    if(rank === settings.leaderboard.top.podium)
      leaderboardEmbed.addField("\u200b", "\u200b")
  }
  
  msg.edit(leaderboardEmbed)
}