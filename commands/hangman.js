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
        blanks = blanks.substr(0, i) + word.charAt(i) + blanks.substr(i + 1)
      }
    }

    if(!blanks.includes("-")) message.channel.send("you did it good job")
    clearUserHangman(message.author)

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
    hangmanCache[message.author.id] = {
      word: "quack",
      guesses: 0,
      attempedLetters: []
    }

    message.channel.send(JSON.stringify(hangmanCache, null, 2))
    message.channel.send(hangmanEmbed())
  }
}