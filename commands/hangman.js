exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman

  const clearUserHangman = user => {
    hangmanCache[user.id] = undefined
    delete hangmanCache[user.id]
  }

  const hangmanEmbed = async channel => {
    const hidden = config.hangman.hiddenLetterPlaceholder

    const word = hangmanCache[message.author.id].word
    const attempedLetters = hangmanCache[message.author.id].attempedLetters
    let blanks = hidden.repeat(word.length)
    let lettersGuessed = 0

    for(let i = 0; i < word.length; i++) {
      if(attempedLetters.includes(word.charAt(i))) {
        blanks = blanks.substr(0, i) + word.charAt(i) + blanks.substr(i + 1)
        lettersGuessed++
      }
    }

    if(lettersGuessed == word.length) {
      message.channel.send(":tada:")
      clearUserHangman(message.author)
    }

    let emb = new Discord.RichEmbed()
      .setColor(config.hangman.embedColour)
      .setTitle("Hangman")
      .setDescription(blanks)
    
    let msg = await channel.send(emb)
    await msg.react(config.hangman.winReaction)
  }

  if(args[0] == "guess") {
    if(!hangmanCache[message.author.id]) return message.channel.send("You are not currently playing hangman.")
    if(!args[1]) return message.channel.send("Please specify a letter, you idiot.")
    
    const guessChar = args[1].charAt(0).toLowerCase()
    if(!guessChar.match(/[a-z]/gi)) return message.channel.send("You have to guess a letter in the English Alphabet, idiot.")
    if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) return message.channel.send("You've already guessed this letter, idiot.")

    hangmanCache[message.author.id].guesses++
    hangmanCache[message.author.id].attempedLetters.push(guessChar)
    message.channel.send(JSON.stringify(hangmanCache, null, 2))
    hangmanEmbed(message.channel)
  }
  else {
    if(hangmanCache[message.author.id]) return message.channel.send("you are already playing a game of hangman probably")
    hangmanCache[message.author.id] = {
      word: "abc",
      guesses: 0,
      attempedLetters: []
    }

    message.channel.send(JSON.stringify(hangmanCache, null, 2))
    hangmanEmbed(message.channel)
  }
}