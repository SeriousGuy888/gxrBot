exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!args[0])
    return this.help(client, message, args)

  const embed = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setTitle("**__Magic 8 Sphere__**")
    .addField("Question", args.join(" "))
    .addField("Answer", "None")

  message.channel.send(embed)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const embed = new Discord.MessageEmbed()
    .setColor(config.main.colours.help)
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setTitle("**__Magic 8 Sphere__**")
    .setDescription("Ask a question after the command.")

  message.channel.send(embed)
}
