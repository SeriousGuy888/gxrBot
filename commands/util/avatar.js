exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord, getUserArg, embedder } = index

  const user = await getUserArg(message)

  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setDescription("Here you go!")
    .setImage(user.avatarURL({ dynamic: true }))
  embedder.addAuthor(emb, user, "%tag%'s Avatar")

  message.channel.send(emb)
}