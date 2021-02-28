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

  const drawFromDeck = () => {
    const cardIndex = Math.floor(Math.random() * userData.deck.length)
    const card = userData.deck[cardIndex]

    userData.deck.splice(cardIndex, 1)
    return card
  }

  const suits = {
    "spades": "♤",
    "hearts": "♡",
    "clubs": "♧",
    "diamonds": "♢"
  }

  for(const suit in suits) {
    for(const number of ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]) {
      userData.deck.push(new Card(suit, number))
    }
  }


  function handString(hand){
    let output = []
    for(const card of hand){
      output.push(card.getNumber() + suits[card.getSuit()])
    }
    return output.join(", ")
  }

  function gameDisplay(){
    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setColor("#ffff00")
      .setTitle("gambling")
      .setDescription("you're gonna lose all your moolah")
      .addField("Your hand", handString(userData.hand), true)
      .addField("CPU hand", handString(userData.dealer), true)
    
    return emb
  }

  // message.channel.send(cards.map(c => JSON.stringify(c)).join(",").slice(0, 2000))

  userData.hand = [drawFromDeck(), drawFromDeck()]
  userData.dealer = [drawFromDeck(), drawFromDeck()]
  
  const msg = await message.channel.send(gameDisplay())

  const emojis = ["🔨", "🧍"]
  emojis.forEach(async emoji => await msg.react(emoji))

  const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)
  msg.createReactionCollector(filter, { time: 20000 })
    .on("collect", async (reaction, reactor) => {
      reaction.users.remove(reactor).catch(() => {})
      switch(reaction.emoji.name) {
        case "🔨":
          userData.hand.push(drawFromDeck())
          break
        case "🧍":
          break
      }
      msg.edit(gameDisplay())
    })
    .on("end", async collected => {
      msg.edit("No longer collecting reactions.")
      delete gameData[message.author.id]
    })
}