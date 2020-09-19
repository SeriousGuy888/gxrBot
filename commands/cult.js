exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord
  
  let emb = new Discord.MessageEmbed()
    .setColor("#aaaadd")
    .setTitle("Cult Activities Channel Information")
    .setDescription("*Cult channel options have been moved to the config due to infrequent use. You can no longer set them with this command.*")
    .addField("Channel", `<#${config.coopchannels.cult.channel}>`)
    .addField("Phrase", config.coopchannels.cult.phrase)
  
  message.channel.send(emb)
}