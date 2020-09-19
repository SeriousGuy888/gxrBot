exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord
  
  let emb = new Discord.MessageEmbed()
    .setColor("#aaaadd")
    .setTitle("Cult Feature Information")
    .setDescription("*Cult channel options have been moved to the config due to infrequent use. You can no longer set them with this command.*")
    .addField("Channel", `${index.cultCache.id}`)
    .addField("Word", index.cultCache.word)
  
  message.channel.send(emb)
}