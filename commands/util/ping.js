exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, prefix, Discord, timer } = index
  
  const age = await timer.convert(new Date() - client.user.createdAt)
  let ageYears = (age.d / 365).toFixed(2)

  // gets the name of the command used
  const cmdName = message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase().trim().slice(0, config.main.maxCommandNameLength)

  const loadingEmoji = config.main.emojis.loading

  const uptimeStr = await timer.stringify(client.uptime, { truncZero: true })
  let pingEmb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle(cmdName.toLowerCase() == "pong" ? "Ping!" : "Pong!") // will say ping if the command alias pong was used
    .setDescription(loadingEmoji)
    .addField(":clock530: Uptime", `\`${uptimeStr}\``, true)
    .addField(":cake: Age", `I'm \`${ageYears}\` ${ageYears == 1 ? "year" : "years"} old!\n(Dec 18, 2019)`, true)
  if(process.env.DEV_MODE)
    pingEmb.addField(":keyboard: Dev Mode", `\`${process.env.DEV_MODE}\``)
    

  const msg = await message.channel.send(pingEmb)

  const getRoundTripLatency = () => msg.createdTimestamp - message.createdTimestamp
  const getEmbedDescription = () => {
    return [
      "*`Any of these being negative is probably bad.`*",
      `DiscordAPI Shard Latency: \`${client.ws.ping}ms\``,
      `Message Round Trip Latency: \`${getRoundTripLatency()}ms\``,
    ].join("\n")
  }

  pingEmb.setDescription(getEmbedDescription())
  msg.edit(pingEmb)
}

exports.help = async (client, message, args) => {
  message.channel.send("returns the bot ping and the bot uptime")
}