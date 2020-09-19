exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const embedManager = client.util.get("embedManager")

  let emb = embedManager.newEmbed()
    .setColor("#3333ee")
    .setTitle("lorem ipsum")
    .setDescription("dolor sit amet")
    
  message.channel.send(emb)
}