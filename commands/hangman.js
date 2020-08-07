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


    let attemptedLettersList = "[None]"
    if(attempedLetters.length >= 1) attempedLettersList = attempedLetters.join(", ")
    
    let embed = new Discord.RichEmbed()
      .setColor(config.hangman.embedColour)
      .setTitle("Hangman")
      .addField("Word", blanks, false)
      .addField(`All Guesses (${hangmanCache[message.author.id].guesses})`, attemptedLettersList, true)
      .addField(`Incorrect Guesses`, hangmanCache[message.author.id].incorrectGuesses, true)
      .setFooter(`${message.author.tag}'s Hangman Game (${config.prefix}hangman)`)
    
    let msg = await channel.send(message.channel.send(JSON.stringify(hangmanCache, null, 2)), { embed })
    if(lettersGuessed == word.length) {
      clearUserHangman(message.author)
      await msg.react(config.hangman.winReaction)
    }
  }

  if(args[0] == "guess") {
    if(!hangmanCache[message.author.id]) return message.channel.send("You are not currently playing hangman.")
    if(!args[1]) return message.channel.send("Please specify a letter, you idiot.")
    
    const guessChar = args[1].charAt(0).toLowerCase()
    if(!guessChar.match(/[a-z]/gi)) return message.channel.send("You have to guess a letter in the English Alphabet, idiot.")
    if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) return message.channel.send("You've already guessed this letter, idiot.")

    hangmanCache[message.author.id].guesses++
    if(!hangmanCache[message.author.id].word.includes(guessChar)) hangmanCache[message.author.id].incorrectGuesses++
    hangmanCache[message.author.id].attempedLetters.push(guessChar)
    hangmanEmbed(message.channel)
  }
  else {
    if(hangmanCache[message.author.id]) return message.channel.send("You are already playing a game of Hangman. Make a guess or forfeit the game.")
    hangmanCache[message.author.id] = {
      word: "abc",
      guesses: 0,
      incorrectGuesses: 0,
      attempedLetters: []
    }

    hangmanEmbed(message.channel)
  }
}