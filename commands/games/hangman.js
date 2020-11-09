exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const Discord = index.Discord
  const hangmanCache = index.gameCache.hangman
  const config = index.config
  const { settings, words } = config.hangman

  const uniqueCharCount = word => word.split("").filter((x, i, a) => a.indexOf(x) === i).length

  const clearUserHangman = user => {
    hangmanCache[user.id] = undefined
    delete hangmanCache[user.id]
  }

  const hangmanEmbed = async (channel, init) => {
    const hidden = settings.hiddenLetterPlaceholder

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

    let embed = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setTitle(`**__${config.main.botNames.lowerCamelCase} Hangman__**`)
      .setDescription([
        `**WORD SETS:** ${playerData.set}`,
        `**MAX INCORRECT GUESSES:** ${playerData.maxIncorrectGuesses}`,
        "",
        `ℹ️ Why can't I see the execution? [Hover](https://www.youre-not-supposed-to-click-this-idot.com "Because there isnt a good way to display a hanging with variable guess counts.")`,
        `ℹ️ How the duck do I play this? [Hover](https://www.youre-not-supposed-to-click-this-idot.com "Just reply with the letter you want to guess.")`
      ].join("\n"))
      .addField("\u200b", "\u200b")
      .addField(`Word (Length ${word.length})`, `\`${blanks}\``, false)
      .addField("\u200b", "\u200b")
      .addField(`All Guesses (${hangmanCache[message.author.id].guesses})`, `[${attempedLetters.sort().join(", ")}]`, true)
      .addField(`Incorrect Guesses`, hangmanCache[message.author.id].incorrectGuesses, true)
      .setFooter(`Please guess a letter. (Give up? ${config.main.prefix}hangman quit)`)
    
    let msg
    if(init)
      msg = await channel.send(embed)
    else {
      msg = playerData.message
      msg.edit(embed)
    }

    if(playerData.failure) {
      clearUserHangman(message.author)
      await msg.edit(`You lose! The word was \`${playerData.word}\``)
      await msg.react(settings.failureReaction)
    }
    else if(blanks == word) {
      clearUserHangman(message.author)
      await msg.edit(`You win! The word was \`${playerData.word}\``)
      await msg.react(settings.winReaction)
    }
    
    if(init)
      playerData.message = msg
  }

  switch(args[0]) {
    case "play":
      if(hangmanCache[message.author.id]) return message.reply(`You are already playing a game of Hangman. Make a guess or forfeit the game with \`${config.main.prefix}hangman quit\`.`)
      
      let setName, chosenSet
      
      if(!args[1]) {
        setName = `[${settings.defaultSets.join(", ")}]`
        chosenSet = words[settings.defaultSets[Math.floor(Math.random() * settings.defaultSets.length)]]
      }
      else {
        let allowedSets = args[1].split(",")
      
        for(let i in allowedSets) {
          if(!words[allowedSets[i]]) {
            return message.reply("At least one of your specified sets does not exist. Please try again.")
          }
        }

        setName = `[${allowedSets.join(", ")}]`
        chosenSet = words[allowedSets[Math.floor(Math.random() * allowedSets.length)]]
      }
      let setMaxIncorrectGuesses = chosenSet.maxGuesses
      let wordSet = chosenSet.words
      let chosenWord = wordSet[Math.floor(Math.random() * wordSet.length)]

      hangmanCache[message.author.id] = {
        word: chosenWord,
        set: setName,
        maxIncorrectGuesses: Math.min(
          Math.abs(parseInt(args[2])) ||
          Math.max(
            setMaxIncorrectGuesses - Math.floor(uniqueCharCount(chosenWord) / 2),
            1
          ),
          settings.maxAllowedGuesses
        ),
        guesses: 0,
        incorrectGuesses: 0,
        attempedLetters: [],
        failure: false,
        message: null
      }

      hangmanEmbed(message.channel, true)
      break
    case "panel":
      if(!hangmanCache[message.author.id])
        return message.reply(`You are not currently playing Hangman!`)

      let oldMsg = hangmanCache[message.author.id].message
      let oldMsgEmbed = new Discord.MessageEmbed()
        .setColor(config.main.colours.error)
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setTitle(`**__${config.main.botNames.lowerCamelCase} Hangman__**`)
        .setDescription("The player has requested a new game panel.")
      oldMsg.edit(oldMsgEmbed)
      hangmanEmbed(message.channel, true)
      break
    case "forfeit":
    case "quit":
      if(!hangmanCache[message.author.id]) {
        message.reply("You do not have an ongoing hangman game!")
        break
      }
      message.reply(`Ok, forfeiting your hangman game. The word was ${hangmanCache[message.author.id].word}.`)
      clearUserHangman(message.author)
      break
    case "sets":
      message.reply(`Here are the available hangman word sets: \`${Object.keys(words).join(", ")}\`\nUse \`${config.main.prefix}hangman\` to see how to choose a set.\nIf you don't specify, a random word will be chosen from the sets \`${settings.defaultSets.join(", ")}\`.`)
      break
    case "guess":
      const playerData = hangmanCache[message.author.id]
      if(!hangmanCache[message.author.id]) return message.reply("You are not currently playing hangman.")
      if(hangmanCache[message.author.id].message.channel.id != message.channel.id) return message.reply("You are already playing in another channel. Please use `hangman quit` first.")
      if(!args[1]) return message.reply("Please specify a letter, you idiot.")
      
      const guessChar = args[1].charAt(0).toLowerCase()
      if(!guessChar.match(/[a-z]/gi)) {
        message.delete()
        message.reply("You have to guess a letter in the English Alphabet, idiot.").then(msg => setTimeout(() => {
          msg.delete()
        }, settings.errMsgDelTimeout))
        return
      }
      if(hangmanCache[message.author.id].attempedLetters.includes(guessChar)) {
        message.delete()
        message.reply("You've already guessed this letter, idiot.").then(msg => setTimeout(() => {
          msg.delete()
        }, settings.errMsgDelTimeout))
        return
      }

      hangmanCache[message.author.id].guesses++
      if(!hangmanCache[message.author.id].word.includes(guessChar)) playerData.incorrectGuesses++
      hangmanCache[message.author.id].attempedLetters.push(guessChar)

      if(playerData.incorrectGuesses >= playerData.maxIncorrectGuesses) playerData.failure = true

      hangmanEmbed(message.channel)
      break
    default:
      this.help(client, message, args)
      break
  }
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const { settings } = config.hangman
  const Discord = index.Discord

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setTitle("**Hangman**")
    .setColor(config.main.colours.help)
    .setDescription("Play a game of hangman!")
    .addField("Syntax", `${config.main.prefix}hangman <play | quit | sets> ([word sets] [max incorrect guesses])`)
    .addField("\u200b", "\u200b")
    .addField("Examples", [
      `**Play with Default Words**`,
      ` ${config.main.prefix}hangman play`,
      "",
      `**Play with Custom Settings**`,
      ` ${config.main.prefix}hangman play hard,impossible ${settings.maxAllowedGuesses}`,
      "",
      `**Get New Game Panel**`,
      ` ${config.main.prefix}hangman panel`,
      " *For when someone decides to start playing hangman or using Dank Memer in the same channel as your hangman game. This command will give you a new game panel*",
      "",
      `**Forfeit Game**`,
      ` ${config.main.prefix}hangman quit`,
      "",
      `**See Available Word Sets**`,
      ` ${config.main.prefix}hangman sets`,
    ].join("\n"))
  message.channel.send(embed)
}