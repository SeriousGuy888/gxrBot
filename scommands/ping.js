const index = require("../index.js")
const { client, config, Discord } = index
const { timer } = client.util

module.exports = {
  name: "ping",
  description: "Returns information about my ping and uptime.",
  execute: async (interaction, args) => {
    const age = await timer.convert(new Date() - client.user.createdAt)
    let ageYears = (age.d / 365).toFixed(2)
  
    const loadingEmoji = config.main.emojis.loading
    const uptimeStr = await timer.stringify(client.uptime, { truncZero: true })
    let pingEmb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(":ping_pong: Pong!")
      .setDescription(loadingEmoji)
      .addField(":clock530: Uptime", `\`${uptimeStr}\``, true)
      .addField(":cake: Age", `I'm \`${ageYears}\` ${ageYears == 1 ? "year" : "years"} old!\n(Dec 18, 2019)`, true)
    if(process.env.DEV_MODE) pingEmb.addField(":keyboard: Dev Mode", `\`${process.env.DEV_MODE}\``)
  
    const msg = await interaction.followUp({ embeds: [pingEmb] })
  
    const getRoundTripLatency = () => msg.createdTimestamp - interaction.createdTimestamp
    const getEmbedDescription = () => {
      return [
        "*`Any of these being negative is probably bad.`*",
        `DiscordAPI Shard Latency: \`${client.ws.ping}ms\``,
        `Message Round Trip Latency: \`${getRoundTripLatency()}ms\``,
      ].join("\n")
    }
  
    pingEmb.setDescription(getEmbedDescription())
    interaction.editReply({ embeds: [pingEmb] })
  }
}