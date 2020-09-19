exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord
  
  let emb = new Discord.MessageEmbed()
    .setColor("#aaaadd")
    .setTitle("OWS Info")
    .setDescription("*OWS channel options have been moved to the config due to infrequent use. You can no longer set them with this command.*")
    .addField("Channel", `${config.coopchannels.ows.channel}`)
  
  message.channel.send(emb)
}