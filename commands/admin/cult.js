exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord
  
  const cultConfig = config.coopchannels.cult

  let emb = new Discord.MessageEmbed()
    .setColor(cultConfig.embedColour)
    .setTitle("Cult Activities Channel Information")
    .setDescription("*Cult channel options have been moved to the config due to infrequent use. You can no longer set them with this command.*")
    .addField("Channel", `<#${cultConfig.channel}>`)
    .addField("Phrase", cultConfig.phrase)
  
  message.channel.send({ embeds: [emb] })
}