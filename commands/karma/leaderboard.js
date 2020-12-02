exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, db, timeConvert, karmaQueue, karmaCache, commandCooldowns } = index

  // let cooldown = 15 * 1000 // ms
  // if(commandCooldowns.leaderboard[message.author.id]) {
  //   let cooldownRemaining = new Date() - commandCooldowns.leaderboard[message.author.id]
  //   if(cooldownRemaining < cooldown) {
  //     let cooldownRemainingHuman = await timeConvert(cooldownRemaining)
  //     message.channel.send(`Please stop killing my database.\nYou need to wait another \`${cooldown / 1000 - cooldownRemainingHuman.s} seconds\` before sending another query.`)
  //     return
  //   }
  // }

  // commandCooldowns.leaderboard[message.author.id] = new Date()

  const leaderboardEmbed = new Discord.MessageEmbed()
    .setColor("#d223d2")
    .setTitle("Discord Karma Leaderboard")
    .setDescription(`Because *everyone* loves having their popularity quantified with a single number! :D`)
    .setFooter("Pending karma is karma that is temporarily being stored by the bot until it can be sent to the database.")

  const usersColl = db.collection("users")
  const snapshot = await usersColl.orderBy("karma").limit(25).get()

  if(karmaCache.length === 0) {
    snapshot.forEach(async doc => {
      let user = client.users.cache.find(u => u.id === doc.id)
      const data = doc.data()
  
      if(!user)
        if(data.tag)
          user = `${data.tag} [Cached]` // if user's tag is stored
        else
          user = `ID: ${doc.id}` // display as id otherwise
      else
        user = user.tag // if the user is cached and their tag is found
      
      if(user === null)
        user = `ID: ${doc.id}`
  
      let karma = data.karma
  
      karmaCache.push({
        title: user,
        content: karma,
        userId: doc.id,
      })
    })

    karmaCache.reverse()
  }

  const getRankingStr = (rank, isAuthor) => {
    // this function will give medal emojis for the first 3
    // it will return a star if the user is not in the top 3 for the user's entry
    // otherwise, it will just return #rank
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

  karmaCache
    .forEach(field => {
      let content = field.content
      if(karmaQueue[field.userId])
        content += ` and ${karmaQueue[field.userId]} pending`
      leaderboardEmbed.addField(`${getRankingStr(karmaCache.indexOf(field) + 1, field.userId === message.author.id)} | \`${field.title}\``, content)
    })
  
  message.channel.send(leaderboardEmbed)
}