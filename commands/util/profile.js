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

    if(member)
      mutualGuilds.push(`${knownGuilds[guildId]}`)
  }
  emb
    .addField("Member of", mutualGuilds.join("\n") || "This user does not share any of my known guilds.")
    .addField("[WIP] Stats", JSON.stringify(await statTracker.get(user.id)).slice(0, 1024) || "None")
    .addField("Badges", "Psst! Badges have been moved to the `mybadges` command.")


  message.channel.send(emb)
}