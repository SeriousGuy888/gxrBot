exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord
  
  const owsConfig = config.coopchannels.ows

  let emb = new Discord.MessageEmbed()
    .setColor(owsConfig.embedColour)
    .setTitle("OWS Info")
    .setDescription("*OWS channel options have been moved to the config due to infrequent use. You can no longer set them with this command.*")
    .addField("Channel", `<#${owsConfig.channel}>`)
  
  message.channel.send(emb)
}