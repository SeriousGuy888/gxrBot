exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { getUserArg } = client.functions
  const { embedder, statTracker } = client.util

  const user = await getUserArg(message)

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setThumbnail(user.avatarURL({ dynamic: true, size: 2048 }))
  embedder.addAuthor(emb, user, `%tag%'s ${config.main.botNames.lowerCamelCase} Profile`)

  const { knownGuilds } = config.main
  let mutualGuilds = []
  for(const guildId in knownGuilds) {
    const guild = await client.guilds.fetch(guildId).catch(() => {})
    const member = await guild.members.fetch(user.id).catch(() => {})

    if(member) mutualGuilds.push(`${knownGuilds[guildId]}`)
  }

  const userStats = await statTracker.get(user.id)
  const statsToInclude = {
    commands_run: "⏯️",
    coop_cult: "🧿",
    coop_ows: "📕",
  }

  let statText = ""
  let longestStatNameLength = 0


  for(const statName in statsToInclude) {
    if(statName.length > longestStatNameLength) {
      longestStatNameLength = statName.length
    }
  }

  for(const statName in statsToInclude) {
    if(userStats[statName]) {
      let statEmoji = statsToInclude[statName] || ""
      let paddedStatName = `\`${statName.toUpperCase().padStart(longestStatNameLength, " ")}\``

      statText += `${statEmoji} ${paddedStatName}: \`${userStats[statName]}\`\n`
    }
  }


  emb
    .addField("Member of", mutualGuilds.join("\n") || "This user does not share any of my known guilds.")
    .addField("Stats (See full stats with `-stats`)", statText || "Not Found")
    .addField("Badges", "Psst! Badges have been moved to the `mybadges` command.")


  message.channel.send(emb)
}

exports.disabled = "temp disabled during discord.js v13 update"