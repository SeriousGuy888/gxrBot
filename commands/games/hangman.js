exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { gamePlayerData } = require("../../cache.js")
  const { config, Discord } = index
  const { embedder, gamer } = client.util
  const { settings, words } = config.hangman

  const uniqueCharCount = word => word.split("").filter((x, i, a) => a.indexOf(x) === i).length

  const clearUserHangman = user => {
    gamer.clearGame(user.id)
  }

  const tickHangman = async (channel, init) => {
    const hidden = settings.hiddenLetterPlaceholder

    const playerData = gamePlayerData[message.author.id].data
    const word = playerData.word
    const attempedLetters = playerData.attempedLetters
    let blanks = hidden.repeat(word.length)

    for(let i = 0; i < word.length; i++) {
      if(attempedLetters.includes(word.charAt(i)) || settings.revealedByDefault.includes(word.charAt(i))) {
        blanks = blanks.substr(0, i) + word.charAt(i) + blanks.substr(i + 1)
      }
    }
    
    // if(playerData.failure)
    //   blanks = word

    if(!init && message.deletable)
        message.delete()

    let embed = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(`**__${config.main.botNames.lowerCamelCase} Hangman__**`)
      .setDescription([
        `**WORD SETS:** ${playerData.set}`,
        `**MAX INCORRECT GUESSES:** ${playerData.maxIncorrectGuesses}`,
        "",
        `ℹ️ Why can't I see the execution? [Hover](https://www.youre-not-supposed-to-click-this-idot.com "Because there isnt a good way to display a hanging with variable guess counts.")`,
        `ℹ️ How do I guess a letter? [Hover](https://www.youre-not-supposed-to-click-this-idot.com "Send a message with the letter you want to guess.")`
      ].join("\n"))
    embedder.addBlankField(embed)
      .addField(`Word (${word.length})`, `\`${blanks}\`${playerData.failure ? "\nThe word was `" + word + "`" : ""}`, false)
    embedder.addBlankField(embed)
      .addField(`All Guesses (${gamePlayerData[message.author.id].data.guesses})`, `[${attempedLetters.sort().join(", ")}]`, true)
      .addField(`Incorrect Guesses`, gamePlayerData[message.author.id].data.incorrectGuesses, true)
      .setFooter(`ID: ${message.author.id}   |   (Give up? ${config.main.prefix}quit_game)`)
    embedder.addAuthor(embed, message.author)

    
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
      if(gamer.isPlaying(message.author.id)) {
        message.reply(`You are already playing another of my games! To prevent everything from breaking, you will need to quit this game first. Use command \`quit_game\`.`)
        return
      }
      
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
      let setMaxIncorrectGuesses = chosenSet.maxGuesses || 12
      let wordSet = chosenSet.words
      let chosenWord = wordSet[Math.floor(Math.random() * wordSet.length)]

      gamer.createGame(message.author.id, "hangman", {
        word: chosenWord,
        set: setName,
        maxIncorrectGuesses: Math.min(
          Math.abs(parseInt(args[2])) || Math.max(setMaxIncorrectGuesses - Math.floor(uniqueCharCount(chosenWord) / 2), 1),
          settings.maxAllowedGuesses
        ),
        guesses: 0,
        incorrectGuesses: 0,
        attempedLetters: [],
        failure: false,
        message: null
      })

      tickHangman(message.channel, true)
      break
    case "panel":
      if(gamer.isPlaying(message.author.id, "hangman")) {
        return message.reply(`You are not currently playing Hangman!`)
      }

      let oldMsg = gamePlayerData[message.author.id].data.message
      let oldMsgEmbed = new Discord.MessageEmbed()
        .setColor(config.main.colours.error)
        .setAuthor(message.author.tag, message.author.avatarURL())
        .setTitle(`**__${config.main.botNames.lowerCamelCase} Hangman__**`)
        .setDescription("The player has requested a new game panel.")
      tickHangman(message.channel, true)
      oldMsg.edit(oldMsgEmbed)
      break
    case "forfeit":
    case "quit":
      client
        .commands
        .get("quit_game")
        .run(client, message, [])
      break
    case "sets":
      message.reply(`Here are the available hangman word sets: \`${Object.keys(words).join(", ")}\`\nUse \`${config.main.prefix}hangman\` to see how to choose a set.\nIf you don't specify, a random word will be chosen from the sets \`${settings.defaultSets.join(", ")}\`.`)
      break
    case "guess":
      const playerData = gamePlayerData[message.author.id].data
      if(!gamePlayerData[message.author.id].data)
        return message.reply("You are not currently playing hangman.")
      if(gamePlayerData[message.author.id].data.message.channel.id != message.channel.id)
        return message.reply("You are already playing in another channel. Please use `hangman quit` first.")
      if(!args[1])
        return message.reply("Please specify a letter, you idiot.")
      
      const guessChar = args[1].charAt(0).toLowerCase()
      if(!guessChar.match(/[a-z]/gi)) {
        if(message.deletable)
          message.delete()
        message.reply("You have to guess a letter in the English Alphabet, idiot.")
          .then(msg => setTimeout(() => {
            if(msg.deletable)
              msg.delete()
          }, settings.errMsgDelTimeout))
        return
      }
      if(gamePlayerData[message.author.id].data.attempedLetters.includes(guessChar)) {
        if(message.deletable)
          message.delete()
        message.reply("You've already guessed this letter, idiot.")
          .then(msg => {
            if(msg.deletable) {
              msg.delete({ timeout: settings.errMsgDelTimeout })
            }
          })
        return
      }

      gamePlayerData[message.author.id].data.guesses++
      if(!gamePlayerData[message.author.id].data.word.includes(guessChar))
        playerData.incorrectGuesses++

      gamePlayerData[message.author.id].data.attempedLetters.push(guessChar)
      if(playerData.incorrectGuesses >= playerData.maxIncorrectGuesses)
        playerData.failure = true

      tickHangman(message.channel)
      break
    default:
      this.help(client, message, args)
      break
  }
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { commandHelpEmbed } = index
  const config = index.config
  const { settings } = config.hangman

  const embed = commandHelpEmbed(message, {
    title: "**Hangman**",
    description: "Play a game of hangman!",
    syntax: `${config.main.prefix}hangman <play | panel | quit | sets> ([word sets] [max incorrect guesses])`,
    example: [
      `**Play with Default Words**`,
      ` ${config.main.prefix}hangman play`,
      "",
      `**Play with Custom Settings**`,
      ` ${config.main.prefix}hangman play hard,impossible ${settings.maxAllowedGuesses}`,
      "",
      `**Get New Game Panel**`,
      ` ${config.main.prefix}hangman panel`,
      " *For when someone decides to start playing hangman or using Dank Memer in the same channel as your hangman game. This command will give you a new game panel so you don't have to scroll up.*",
      "",
      `**Forfeit Game**`,
      ` ${config.main.prefix}quit_game`,
      "",
      `**See Available Word Sets**`,
      ` ${config.main.prefix}hangman sets`,
    ].join("\n"),
  })
  
  message.channel.send({ embeds: embed })
}

exports.disabled = "temp disabled during discord.js v13 update"