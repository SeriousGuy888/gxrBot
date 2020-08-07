exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const words = require("../data/hangman/words.json")
  const config = index.config
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman

  const clearUserHangman = user => {
    hangmanCache[user.id] = undefined
    delete hangmanCache[user.id]
  }

  const hangmanEmbed = async channel => {
    const hidden = config.hangman.hiddenLetterPlaceholder

    const playerData = hangmanCache[message.author.id]
    const word = playerData.word
    const attempedLetters = playerData.attempedLetters
    let blanks = hidden.repeat(word.length)

    for(let i = 0; i < word.length; i++) {
      if(attempedLetters.includes(word.charAt(i))) {
        blanks = blanks.substr(0, i) + word.charAt(i) + blanks.substr(i + 1)
      }
    }
    
    if(playerData.failure) {
      blanks = word
    }

    let embed = new Discord.RichEmbed()
      .setColor(config.hangman.embedColour)
      .setAuthor(message.author.tag, message.author.avatarURL)
      .setTitle("**__g9lBot Hangman__**")
      .setDescription(`**WORD SET:** ${playerData.set}\n**MAX INCORRECT GUESSES:** ${playerData.maxIncorrectGuesses}`)
      .addBlankField()
      .addField(`Word (Length ${word.length})`, blanks, false)
      .addBlankField()
      .addField(`All Guesses (${hangmanCache[message.author.id].guesses})`, `[${attempedLetters.join(", ")}]`, true)
      .addField(`Incorrect Guesses`, hangmanCache[message.author.id].incorrectGuesses, true)
      .setFooter(`Give up? ${config.prefix}hangman quit`)
    
    let msg = await channel.send(embed)
    if(playerData.failure) {
      clearUserHangman(message.author)
      await msg.edit(`You lose! The word was \`${playerData.word}\``)
      await msg.react(config.hangman.failureReaction)
    }
    else if(blanks == word) {
      clearUserHangman(message.author)
      await msg.edit(`You win! The word was \`${playerData.word}\``)
      await msg.react(config.hangman.winReaction)
    }
  }

  switch(args[0]) {
    case "guess":
      const playerData = hangmanCache[message.author.id]
      if(!hangmanCache[message.author.id]) return message.channel.send("You are not currently playing hangman.")
      if(!args[1]) return message.channel.send("Please specify a letter, you idiot.")
      
      const guessChar = args[1].charAt(0).toLowerCase()
      if(!guessChar.match(/[a-z]/gi)) return message.channel.send("You have to guess a letter in the English Alphabet, idiot.")
      if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) return message.channel.send("You've already guessed this letter, idiot.")

      hangmanCache[message.author.id].guesses++
      if(!hangmanCache[message.author.id].word.includes(guessChar)) playerData.incorrectGuesses++
      hangmanCache[message.author.id].attempedLetters.push(guessChar)

      if(playerData.incorrectGuesses >= playerData.maxIncorrectGuesses) playerData.failure = true

      hangmanEmbed(message.channel)
      break
    case "quit":
      message.channel.send(`Ok, forfeiting your hangman game. The word was ${hangmanCache[message.author.id].word}.`)
      clearUserHangman(message.author)
      break
    case "play":
      if(hangmanCache[message.author.id]) return message.channel.send(`You are already playing a game of Hangman. Make a guess or forfeit the game with \`${config.prefix}hangman quit\`.`)

      let setName = args[1]
      let chosenSet = words[args[1]].words
      if(!words[args[1]]) {
        setName = "[ALL]"
        chosenSet = []
        for(loopSetName of config.hangman.defaultSets) {
          chosenSet = chosenSet.concat(words[loopSetName].words)
        }
      }
      let setMaxIncorrectGuesses = chosenSet.maxGuesses
      let wordSet = chosenSet.words

      hangmanCache[message.author.id] = {
        word: wordSet[Math.floor(Math.random() * wordSet.length)],
        set: setName,
        maxIncorrectGuesses: setMaxIncorrectGuesses,
        guesses: 0,
        incorrectGuesses: 0,
        attempedLetters: [],
        failure: false
      }
  
      hangmanEmbed(message.channel)
      break
    case "sets":
      message.channel.send(`Here are the available hangman word sets: \`${Object.keys(words).join(", ")}\`\nYou can choose which set to use with ${config.prefix}hangman play [set name].\nIf you don't specify, a random word will be chosen from the sets \`${config.hangman.defaultSets.join(", ")}\`.`)
      break
    default:
      message.channel.send(`${config.prefix}hangman <play | sets | quit | guess> [Params]`)
      break
  }
}