exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  const { embedder } = client.util
  
  let gameData = index.gameCache.blackjack
  let userData = gameData[message.author.id]

  if(!userData) {
    userData = {
      deck: [],
      hand: [],
      dealer: []
    }
    message.channel.send("created new game instance for you")
  }
  
  
  class Card {
    constructor(suit, number) {
      this.suit = suit
      this.number = number
    }

    getSuit() {
      return this.suit
    }

    getNumber() {
      return this.number
    }

    calcValue() {
      const number = this.number
      const parsedInt = parseInt(cardValue)
      if(parsedInt)
        return parsedInt
      
      if(number === "A")
        return 1
      else
        return 10
    }
  }

  const suits = {
    spades: "♤",
    hearts: "♡",
    clubs: "♧",
    diamonds: "♢"
  }
  const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  let cards = []

  for(const suit in suits) {
    for(const number of numbers) {
      cards.push(new Card(suit, number))
    }
  }

  // message.channel.send(cards.map(c => JSON.stringify(c)).join(",").slice(0, 2000))



  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor("#ffff00")
    .setTitle("gambling")
    .setDescription("you're gonna lose all your moolah")
  
  const msg = await message.channel.send(emb)

  const emojis = ["🧍", "🔨"]
  emojis.forEach(async emoji => await msg.react(emoji))

  const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)
  msg.createReactionCollector(filter, { time: 2000 })
    .on("collect", async (reaction, reactor) => {
      reaction.users.remove(reactor).catch(() => {})
      switch(reaction.emoji.name) {
        case "🧍":
          break
        case "🔨":
          break
      }

      msg.edit("eeee")
    })
    .on("exit", async collected => {
      // await message.channel.send("No longer collecting reactions.")
      delete gameData[message.author.id]
    })
}