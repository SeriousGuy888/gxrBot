exports.run = (message, options) => {
  const index = require("../index.js")
  const { config, Discord } = index

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setColor(config.main.colours.help)
  
  if(options) {
    if(options.title)
      embed.setTitle(options.title)
    if(options.description)
      embed.setDescription(options.description)
    if(options.syntax)
      embed
        .addField("Syntax", options.syntax)
        .addField("\u200b", "\u200b")
    if(options.example)
      embed
        .addField("Example(s)", options.example)
  }

  return embed
}