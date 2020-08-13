exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const words = require("../data/hangman/words.json")
  const config = index.config
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman

  const uniqueCharCount = word => word.split("").filter((x, i, a) => a.indexOf(x) === i).length

  const clearUserHangman = user => {
    hangmanCache[user.id] = undefined
    delete hangmanCache[user.id]
  }

  const hangmanEmbed = async (channel, init) => {
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

    if(!init) message.delete()

    let embed = new Discord.RichEmbed()
      .setColor(config.hangman.embedColour)
      .setAuthor(message.author.tag, message.author.avatarURL)
      .setTitle("**__g9lBot Hangman__**")
      .setDescription([
        `**WORD SETS:** ${playerData.set}`,
        `**MAX INCORRECT GUESSES:** ${playerData.maxIncorrectGuesses}`,
        "",
        `ℹ️ Why can't I see the execution? [Hover](https://www.example.com "Because there isnt a good way to display a hanging with variable guess counts.")`,
        `ℹ️ How the duck do I play this? [Hover](https://www.example.com "Just reply with the letter you want to guess.")`
      ].join("\n"))
      .addBlankField()
      .addField(`Word (Length ${word.length})`, blanks, false)
      .addBlankField()
      .addField(`All Guesses (${hangmanCache[message.author.id].guesses})`, `[${attempedLetters.sort().join(", ")}]`, true)
      .addField(`Incorrect Guesses`, hangmanCache[message.author.id].incorrectGuesses, true)
      .setFooter(`Please guess a letter. (Give up? ${config.prefix}hangman quit)`)
    
    let msg
    if(!playerData.message) msg = await channel.send(embed)
    else {
      msg = playerData.message
      msg.edit(embed)
    }
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
    
    if(!playerData.message) playerData.message = msg
  }

  switch(args[0]) {
    case "play":
      if(hangmanCache[message.author.id]) return message.channel.send(`You are already playing a game of Hangman. Make a guess or forfeit the game with \`${config.prefix}hangman quit\`.`)
      
      let setName, chosenSet
      
      if(!args[1]) {
        setName = `[${config.hangman.defaultSets.join(", ")}]`
        chosenSet = words[config.hangman.defaultSets[Math.floor(Math.random() * config.hangman.defaultSets.length)]]
      }
      else {
        setName = `[${args[1].split(",").join(", ")}]`
        chosenSet = words[args[1].split(",")[Math.floor(Math.random() * args[1].split(",").length)]]
      }
      let setMaxIncorrectGuesses = chosenSet.maxGuesses
      let wordSet = chosenSet.words
      let chosenWord = wordSet[Math.floor(Math.random() * wordSet.length)]

      hangmanCache[message.author.id] = {
        word: chosenWord,
        set: setName,
        maxIncorrectGuesses: Math.min(Math.abs(parseInt(args[2])) || Math.max(setMaxIncorrectGuesses - uniqueCharCount(chosenWord), 1), config.hangman.maxAllowedGuesses),
        guesses: 0,
        incorrectGuesses: 0,
        attempedLetters: [],
        failure: false,
        message: null
      }

      hangmanEmbed(message.channel, true)
      break
    case "quit":
      message.channel.send(`Ok, forfeiting your hangman game. The word was ${hangmanCache[message.author.id].word}.`)
      clearUserHangman(message.author)
      break
    case "sets":
      message.channel.send(`Here are the available hangman word sets: \`${Object.keys(words).join(", ")}\`\nUse \`${config.prefix}hangman\` to see how to choose a set.\nIf you don't specify, a random word will be chosen from the sets \`${config.hangman.defaultSets.join(", ")}\`.`)
      break
    case "guess":
      const playerData = hangmanCache[message.author.id]
      if(!hangmanCache[message.author.id]) return message.channel.send("You are not currently playing hangman.")
      if(!args[1]) return message.channel.send("Please specify a letter, you idiot.")
      
      const guessChar = args[1].charAt(0).toLowerCase()
      if(!guessChar.match(/[a-z]/gi)) {
        message.delete()
        message.channel.send("You have to guess a letter in the English Alphabet, idiot.").then(msg => setTimeout(() => {
          msg.delete()
        }, config.hangman.errMsgDelTimeout))
        return
      }
      if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) {
        message.delete()
        message.channel.send("You've already guessed this letter, idiot.").then(msg => setTimeout(() => {
          msg.delete()
        }, config.hangman.errMsgDelTimeout))
        return
      }

      hangmanCache[message.author.id].guesses++
      if(!hangmanCache[message.author.id].word.includes(guessChar)) playerData.incorrectGuesses++
      hangmanCache[message.author.id].attempedLetters.push(guessChar)

      if(playerData.incorrectGuesses >= playerData.maxIncorrectGuesses) playerData.failure = true

      hangmanEmbed(message.channel)
      break
    default:
      message.channel.send([
        `\`${config.prefix}hangman play [word set (if multiple, separate with commas)] [max incorrect guess count]\` - Play hangman. (Guess count must be between 1 and ${config.hangman.maxAllowedGuesses})`,
        `\`${config.prefix}hangman quit\` - Forfeit a hangman game.`,
        `\`${config.prefix}hangman sets\` - See available word sets.`,
        `\`${config.prefix}hangman guess <letter>\` - Make a hangman guess.`
      ].join("\n"))
      break
  }
}