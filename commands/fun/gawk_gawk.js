exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index

  let emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setDescription("AJFAAJFJAJAJFJFAJFJFJAAKJAJJ")
    .setFooter("thank you hoang for the idea for this command")
  
  message.channel.send({ embeds: [emb] })
    .then(() => message.delete())
}