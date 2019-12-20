exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const fs = index.fs
  const Discord = index.Discord

  let pingEmb = new Discord.RichEmbed()
    .setColor("#3333ee")
    .setTitle("g8cBot Latency")
    .setDescription(`${Math.round(client.ping)} ms`)
    
  message.channel.send(pingEmb)
}
