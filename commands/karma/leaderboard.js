exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, db, embedder, karmaQueue } = index
  let { karmaCache, messenger } = index

  const settings = config.karma
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.karma,
    title: "Getting Leaderboard Data..."
  })

  const leaderboardEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.karma)
    .setTitle("Discord Karma Leaderboard")
    .setDescription(`Get karma by having people reacting with upvotes on your messages!\n[Leaderboard on Web Panel](${settings.lang.web_panel.leaderboard})\n\u200b`)
    .setFooter(settings.lang.footer)
  embedder.addAuthor(leaderboardEmbed, message.author)

  const usersColl = db.collection("users")

  if(karmaCache.length === 0) {
    const snapshot = await usersColl
      .orderBy("karma", "desc")
      .limit(settings.leaderboard.top.total + 1)
      .get()

    snapshot.forEach(async doc => {
      const data = doc.data()
      let karma = data.karma
  
      karmaCache.push({
        user: `<@${doc.id}>`,
        id: doc.id,
        karma: karma,
      })
    })
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

  for(let i in karmaCache) {
    let field = karmaCache[i]

    if(i == settings.leaderboard.top.total) {
      // leaderboardEmbed.addField("*More Leaderboard Entries...*", `The DiscordAPI limits the amount of fields I can display in this embed.\nOnly the top ${settings.leaderboard.top.total} users are displayed here.\n\nIf you wish to see more users, you can visit the [web panel](${settings.lang.web_panel.leaderboard}) for more entries past the top ${settings.leaderboard.top.total}.\n\u200b\n\u200b`)
      continue
    }

    let rank = parseInt(i) + 1
    let rankingStr = getRankingStr(rank, field.id === message.author.id)

    const { positive, negative } = settings.leaderboard.emojis

    let karma = field.karma
    let emoji = karma > 0 ? positive : negative
    let content = `${emoji} [${karma.toLocaleString()}](${settings.lang.web_panel.user_lookup}?ids=${field.id} "See this user on the web panel.")`

    if(karmaQueue[field.id])
      content += ` and ${karmaQueue[field.id]} pending`
    leaderboardEmbed.addField(`${rankingStr}`, `${field.user}\n${content}` + "\n\u200b", true)
    if(rank === settings.leaderboard.top.podium)
      leaderboardEmbed.addField("\u200b", "\u200b")
  }
  
  msg.edit(leaderboardEmbed)
}