exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman

  if(hangmanCache[message.author.id]) return message.channel.send("you are already playing a game of hangman probably")

  const collectorTimeout = 30
  const cancelEmoji = "❌"

  const clearUserHangman = user => {
    hangmanCache[user.id] = undefined
    delete hangmanCache[user.id]
  }

  hangmanCache[message.author.id] = {
    word: "quack",
    guesses: 0,
    attempedLetters: []
  }
  message.channel.send(JSON.stringify(hangmanCache, null, 2))

  const gameEmbed = new Discord.RichEmbed()
    .setColor("#ad3232")
    .setTitle("guess the word or this human gets executed")
    .setDescription("\\_ ".repeat(hangmanCache[message.author.id].word.length))
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
      clearUserHangman(message.author)
    }
  }).catch(collected => {
    msg.edit("time expired or maybe you chose an invalid option", { embed: {} })
    clearUserHangman(message.author)
  })
}