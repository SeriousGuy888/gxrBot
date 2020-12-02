exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, db, timeConvert, karmaQueue, commandCooldowns } = index

  let cooldown = 15 * 1000 // ms
  if(commandCooldowns.leaderboard[message.author.id]) {
    let cooldownRemaining = new Date() - commandCooldowns.leaderboard[message.author.id]
    if(cooldownRemaining < cooldown) {
      let cooldownRemainingHuman = await timeConvert(cooldownRemaining)
      message.channel.send(`Please stop killing my database.\nYou need to wait another \`${cooldown / 1000 - cooldownRemainingHuman.s} seconds\` before sending another query.`)
      return
    }
  }

  commandCooldowns.leaderboard[message.author.id] = new Date()

  const leaderboardEmbed = new Discord.MessageEmbed()
    .setColor("#d223d2")
    .setTitle("Discord Karma Leaderboard")
    .setDescription(`"I just decided that we really needed this." -Billzo`)
    .setFooter("Pending karma is sent to database every few minutes.")

  const usersColl = db.collection("users")
  const snapshot = await usersColl.orderBy("karma").limit(25).get()
  let lbEntries = []

  snapshot.forEach(async doc => {
    let user = client.users.cache.find(u => u.id === doc.id)
    const data = doc.data()

    if(!user)
      if(data.tag)
        user = `${data.tag} [Cached]`
      else
        user = `ID: ${doc.id}`
    else
      user = user.tag

    let karma = data.karma
    if(karmaQueue[doc.id])
      karma = `${karma} plus ${karmaQueue[doc.id]} pending`

    lbEntries.push({
      title: user,
      content: `**Karma:** ${karma}`,
      userId: doc.id,
    })
  })

  const getRankingStr = (rank, isAuthor) => {
    switch(rank) {
      case 1:
        return ":first_place:"
      case 2:
        return ":second_place:"
      case 3:
        return ":third_place:"
      default:
        if(isAuthor)
          return ":star:"
        else
          return `#${rank}`
    }
  }

  lbEntries
    .reverse()
    .forEach(field => {
      leaderboardEmbed.addField(`${getRankingStr(lbEntries.indexOf(field) + 1, field.userId === message.author.id)} | \`${field.title}\``, field.content)
    })
  
  message.channel.send(leaderboardEmbed)
}