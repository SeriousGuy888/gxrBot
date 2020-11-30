exports.run = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setColor(config.main.colours.help)

  return embed
}