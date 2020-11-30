exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!args[0])
    return this.help(client, message, args)
  
  let choiceArg = args[0].toLowerCase()
  let choice
  if(choiceArg.startsWith("r"))
    choice = "rock"
  if(choiceArg.startsWith("p"))
    choice = "paper"
  if(choiceArg.startsWith("s"))
    choice = "scissors"
  
  if(!choice)
    return message.channel.send("Please choose rock, paper, or scissors.")


  const rng = Math.floor(Math.random() * 3)
  let result
  switch(rng) {
    case 0:
      result = "rock"
      break
    case 1:
      result = "paper"
      break
    case 2:
      result = "scissors"
      break
  }

  const playerGuess = new Discord.MessageAttachment(`./assets/rock_paper_scissors/${choice}.png`, "player.png")
  const botGuess = new Discord.MessageAttachment(`./assets/rock_paper_scissors/${result}.png`, "bot.png")
  const emb = new Discord.MessageEmbed()
    .attachFiles([ botGuess, playerGuess ])
    .setTitle(`My Choice ${result}`)
    .setThumbnail("attachment://bot.png")
    .setDescription(`Your Choice ${choice}`)
    .setImage("attachment://player.png")
    .setAuthor(message.author.tag + " vs " + config.main.botNames.lowerCamelCase, message.author.avatarURL())
    .setColor(config.main.colours.success)

  message.channel.send(emb)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  // const { settings } = config.hangman
  const Discord = index.Discord

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setTitle("**Rock Paper Scissors**")
    .setColor(config.main.colours.help)
    .setDescription("Play a game of stone tree corpse double knife!")
    .addField("Syntax", `${config.main.prefix}rock_paper_scissors <r[ock] | p[aper] | s[cissors]>`)
    .addField("\u200b", "\u200b")
    .addField("Examples", [
      `**Play**`,
      ` ${config.main.prefix}rock_paper_scissors paper`,
    ].join("\n"))
  message.channel.send(embed)
}

// exports.disabled = "currently work in progress"