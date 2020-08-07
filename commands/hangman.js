exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman

  const clearUserHangman = user => {
    hangmanCache[user.id] = undefined
    delete hangmanCache[user.id]
  }

  const hangmanEmbed = () => {
    const word = hangmanCache[message.author.id].word
    const attempedLetters = hangmanCache[message.author.id].attempedLetters
    let blanks = "-".repeat(word.length)
    for(let i = 0; i < word.length; i++) {
      if(attempedLetters.includes(word.charAt(i))) {
        blanks.charAt(i) = word.charAt(i)
      }
    }

    let emb = new Discord.RichEmbed()
      .setColor("#ad3232")
      .setTitle("guess the word or this human gets executed")
      .setDescription(blanks)
    return emb
  }

  if(args[0] == "guess") {
    if(!hangmanCache[message.author.id]) return message.channel.send("You are not currently playing hangman.")
    if(!args[1]) return message.channel.send("Please specify a letter, you idiot.")
    
    const guessChar = args[1].charAt(0).toLowerCase()
    if(!guessChar.match(/[a-z]/gi)) return message.channel.send("You have to guess a letter in the English Alphabet, idiot.")
    if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) return message.channel.send("You've already guessed this letter, idiot.")

    hangmanCache[message.author.id].attempedLetters.push(guessChar)
    message.channel.send(JSON.stringify(hangmanCache, null, 2))
    message.channel.send(hangmanEmbed())
  }
  else {
    if(hangmanCache[message.author.id]) return message.channel.send("you are already playing a game of hangman probably")
  
    const collectorTimeout = 30
    const cancelEmoji = "❌"
  
    hangmanCache[message.author.id] = {
      word: "quack",
      guesses: 0,
      attempedLetters: []
    }
    message.channel.send(JSON.stringify(hangmanCache, null, 2))
  
    const gameEmbed = hangmanEmbed()
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
}