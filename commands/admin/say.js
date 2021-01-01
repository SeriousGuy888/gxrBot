exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!config.admins.ids[message.author.id]) {
    message.reply("no permission")
    return
  }

  await message.channel.send(args.join(" ") || `you need to specify something for me to say dumbash ${message.author}`)

  if(message.deletable)
    message.delete()
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.help)
    .setTitle("say")
    .setDescription("say")
  return message.channel.send(emb)
}