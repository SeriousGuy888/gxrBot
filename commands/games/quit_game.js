exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { embedder, gamer } = client.util

  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)

  if(gamer.isPlaying(message.author.id)) {
    const playerData = gamer.getPlayerData(message.author.id)
    emb
      .setColor(config.main.colours.success)
      .setTitle("Game Quit")
      .setDescription(`Your game of \`${playerData.game}\` was forfeited.`)
    gamer.clearGame(message.author.id)
  }
  else {
    emb
      .setColor(config.main.colours.error)
      .setTitle("Game Not Found")
      .setDescription("You were not playing any game to forfeit.")
  }

  message.channel.send(emb)
}

exports.disabled = "temp disabled during discord.js v13 update"