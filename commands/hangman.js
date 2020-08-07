exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman

  if(hangmanCache[message.author.id]) return message.channel.send("you are already playing a game of hangman probably")

  const collectorTimeout = 30
  const cancelEmoji = "❌"

  hangmanCache[message.author.id] = {
    word: "quack",
    guesses: -1,
    stupid: true
  }
  message.channel.send(JSON.stringify(hangmanCache, null, 2))

  const gameEmbed = new Discord.RichEmbed()
    .setTitle("guess the word or this human gets executed")
    .setDescription("aifhsjldfgujdofgidfgll/ll")
  const msg = await message.channel.send(gameEmbed)

  await msg.react(cancelEmoji)
  
  const filter = (reaction, user) => reaction.emoji.name == cancelEmoji && user.id == message.author.id
  msg.awaitReactions(filter, {
    max: 1,
    time: collectorTimeout * 1000,
    errors: ["time"]
  }).then(collected => {
    const reaction = collected.first()

    if(reaction.emoji.name === cancelEmoji) {
      message.channel.send("cancelled?")
    }
  }).catch(collected => {
    msg.edit("time expired or maybe you chose an invalid option", {
      embed: {}
    })
    hangmanCache[message.author.id] = undefined
    delete hangmanCache[message.author.id]
  })
}