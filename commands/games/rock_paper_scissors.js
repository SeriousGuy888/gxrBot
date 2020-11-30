exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!args[0])
    return this.help(client, message, args)
  
  let playerChoiceArg = args[0].toLowerCase()
  let playerChoice
  if(playerChoiceArg.startsWith("r"))
    playerChoice = "rock"
  if(playerChoiceArg.startsWith("p"))
    playerChoice = "paper"
  if(playerChoiceArg.startsWith("s"))
    playerChoice = "scissors"
  
  if(!playerChoice)
    return message.channel.send("Please choose rock, paper, or scissors.")


  const rng = Math.floor(Math.random() * 3)
  let botChoice
  switch(rng) {
    case 0:
      botChoice = "rock"
      break
    case 1:
      botChoice = "paper"
      break
    case 2:
      botChoice = "scissors"
      break
  }

  const getWinner = (p1, p2) => {
    const convertChoice = c => {
      switch(c) {
        case "rock":
          return 0
        case "paper":
          return 1
        case "scissors":
          return 2
        default:
          return -1
      }
    }

    let p1Num = convertChoice(p1)
    let p2Num = convertChoice(p2)
    let winNum

    if(p1Num === p2Num)
      return 0
    if(p1Num > p2Num)
      winNum = 1
    else
      winNum = 2
    
    if(Math.abs(p1Num - p2Num) === 2)
      if(winNum === 1)
        winNum = 2
      else
        winNum = 1
    
    return winNum
  }
  const getChoiceEmoji = c => {
    switch(c) {
      case "rock":
        return ":rock:"
      case "paper":
        return ":scroll:"
      case "scissors":
        return ":scissors:"
    }
  }

  const playerGuess = new Discord.MessageAttachment(`./assets/rock_paper_scissors/${playerChoice}.png`, "player.png")
  const botGuess = new Discord.MessageAttachment(`./assets/rock_paper_scissors/${botChoice}.png`, "bot.png")
  const winner = getWinner(playerChoice, botChoice)
  const botName = config.main.botNames.lowerCamelCase
  const emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setAuthor(message.author.tag + " vs " + botName, message.author.avatarURL())
    .attachFiles([ botGuess, playerGuess ])
    .setTitle(`${getChoiceEmoji(botChoice)} **My Choice** :arrow_right:`)
    .setThumbnail("attachment://bot.png")
    .setDescription(`**Winner:** ${winner === 0 ? ":scales: TIE" : winner === 1 ? ":tada: " + message.author.tag : ":robot: " + botName}`)
    .addField(`${getChoiceEmoji(playerChoice)} **Your Choice**`, ":arrow_down:")
    .setImage("attachment://player.png")
    .setFooter("Rock paper scissors: `-rps`")
    

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
    .setDescription("Play a game of rock paper scissors!")
    .addField("Syntax", `${config.main.prefix}rock_paper_scissors <r[ock] | p[aper] | s[cissors]>`)
    .addField("\u200b", "\u200b")
    .addField("Examples", [
      `**Play**`,
      ` ${config.main.prefix}rock_paper_scissors paper`,
    ].join("\n"))
  message.channel.send(embed)
}

// exports.disabled = "currently work in progress"