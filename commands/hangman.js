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
    
    let embed = new Discord.RichEmbed()
      .setColor(config.hangman.embedColour)
      .setAuthor(message.author.tag, message.author.avatarURL)
      .setTitle("**__g9lBot Hangman__**")
      .setDescription(`**WORD SET:** ${playerData.set}\n**MAX INCORRECT GUESSES:** ${playerData.maxIncorrectGuesses}`)
      .addField("Word", blanks, false)
      .addBlankField()
      .addField(`All Guesses (${hangmanCache[message.author.id].guesses})`, `[${attempedLetters.join(", ")}]`, true)
      .addField(`Incorrect Guesses`, hangmanCache[message.author.id].incorrectGuesses, true)
      .setFooter(`Give up? ${config.prefix}hangman quit`)
    
    let msg = await channel.send(`You win! The word was \`${playerData.word}\``, { embed })
    if(blanks == word) {
      clearUserHangman(message.author)
      await msg.react(config.hangman.winReaction)
    }
  }

  switch(args[0]) {
    case "guess":
      if(!hangmanCache[message.author.id]) return message.channel.send("You are not currently playing hangman.")
      if(!args[1]) return message.channel.send("Please specify a letter, you idiot.")
      
      const guessChar = args[1].charAt(0).toLowerCase()
      if(!guessChar.match(/[a-z]/gi)) return message.channel.send("You have to guess a letter in the English Alphabet, idiot.")
      if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) return message.channel.send("You've already guessed this letter, idiot.")

      hangmanCache[message.author.id].guesses++
      if(!hangmanCache[message.author.id].word.includes(guessChar)) hangmanCache[message.author.id].incorrectGuesses++
      hangmanCache[message.author.id].attempedLetters.push(guessChar)
      hangmanEmbed(message.channel)
      break
    case "quit":
      message.channel.send(`Ok, forfeiting your hangman game. The word was ${hangmanCache[message.author.id].word}.`)
      clearUserHangman(message.author)
      break
    case "play":
      if(hangmanCache[message.author.id]) return message.channel.send(`You are already playing a game of Hangman. Make a guess or forfeit the game with \`${config.prefix}hangman quit\`.`)

      let setName = args[1]
      let wordSet = words[args[1]]
      if(!words[args[1]]) {
        setName = "[ALL]"
        wordSet = []
        for(loopSetName of config.hangman.defaultSets) {
          wordSet = wordSet.concat(words[loopSetName])
        }
      }

      hangmanCache[message.author.id] = {
        word: wordSet[Math.floor(Math.random() * wordSet.length)],
        set: setName,
        maxIncorrectGuesses: 5,
        guesses: 0,
        incorrectGuesses: 0,
        attempedLetters: []
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