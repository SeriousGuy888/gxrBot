exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index

  let emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle("Gawk Gawk")
    .setDescription("AJFAAJFJAJAJFJFAJFJFJAAKJAJJ")
    .setFooter("thank you hoang for the idea")
  
  message.channel.send(emb)
}