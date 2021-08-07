const index = require("../index.js")
const { client, config, Discord, karmaQueue } = index
let { karmaLeaderboardCache } = index
const { karmanator } = client.util
const { getEasterLink } = client.functions
const settings = config.karma

module.exports = {
  name: "leaderboard",
  description: "Karma Leaderboard",
  defer: true,
  execute: async (interaction, options) => {
    const { positive, negative } = settings.leaderboard.emojis
  
    let description = [
      `Have people to your messages with ${positive} or ${negative} to affect your ~~popularity~~ karma score!`,
      "",
      `[What is karma?](${config.main.links.github_pages}#faq-karma)`,
      config.main.guild.id !== interaction.guild.id ? settings.lang.unavailableInGuild : "",
      "\u200b"
    ]
  
    const leaderboardEmbed = new Discord.MessageEmbed()
      .setColor(settings.colours.karma)
      .setTitle("Discord Karma Leaderboard")
      .setDescription(description.join("\n"))
      .setFooter(settings.lang.footer)
  
  
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
  
      if(parseInt(i) === settings.leaderboard.top.total) continue
  
      let rank = parseInt(i) + 1
      let rankingStr = getRankingStr(rank, field.id === interaction.user.id)
  
      let karma = field.karma
      let emoji = karma > 0 ? positive : negative
      let content = `${emoji} [${karma.toLocaleString()}](${getEasterLink()})`
  
      if(karmaQueue[field.id])
        content += ` and ${karmaQueue[field.id]} pending`
      leaderboardEmbed.addField(`${rankingStr}`, `${field.user}\n${content}` + "\n\u200b", true)
      if(rank === settings.leaderboard.top.podium)
        leaderboardEmbed.addField("\u200b", "\u200b")
    }
    
    interaction.followUp({ embeds: [leaderboardEmbed] })
  }
}