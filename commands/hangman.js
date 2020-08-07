exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord

  message.channel.send("idk what im doing")

  const collectorTimeout = 30
  const cancelEmoji = "❌"

  const gameEmbed = new Discord.RichEmbed()
    .setTitle("guess the word or this human gets executed")
    .setDescription("aifhsjldfgujdofgidfgll/ll")
  const msg = await message.channel.send(gameEmbed)
  await msg.react(cancelEmoji)
  // await msg.react(b)
  // await msg.react(c)
  // await msg.react(d)
  
  const filter = (reaction, user) => reaction.emoji.name == cancelEmoji && user.id == message.author.id
  msg.awaitReactions(filter, {
    max: 1,
    time: collectorTimeout * 1000,
    errors: ["time"]
  }).then(collected => {
    const reaction = collected.first()

    if(reaction.emoji.name === cancelEmoji) message.channel.send("Correct")
    else message.channel.send("Incorrect")
  }).catch(collected => {
    msg.edit("time expired or maybe you chose an invalid option", {
      embed: {}
    })
  })
}