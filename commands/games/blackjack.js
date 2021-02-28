exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  const { embedder } = client.util
  
  let gameData = index.gameCache.blackjack
  let userData = gameData[message.author.id]
  
  
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
  }
  class CardCollection {
    constructor(cards) {
      this.cards = cards ?? []
    }

    toString() {
      let output = []
      for(const card of this.cards) {
        output.push(`\`${card.getNumber()}${suits[card.getSuit()]}\``)
      }
      return `**${output.join(" ")}**`
    }

    add(card) {
      this.cards.push(card)
      return this
    }
  }
  class Deck extends CardCollection {
    draw() {
      const cardIndex = Math.floor(Math.random() * this.cards.length)
      const card = this.cards[cardIndex]
  
      this.cards.splice(cardIndex, 1)
      return card
    }
  }
  class Hand extends CardCollection {
    constructor(cards) {
      super()
      this.stood = false
    }

    getValue() {
      let cards = this.cards

      const aces = []
      for(const i in cards) {
        if(cards[i].number === "A") {
          aces.push(cards[i])
          cards.splice(i, 1)
        }
      }

      let value = 0
      for(const i in cards) {
        if(cards[i].number.match(/[JQK]/)) {
          value += 10
        }
        else {
          value += parseInt(cards[i].number)
        }
      }

      aces.forEach(() => {
        if(value + 11 > 21)
          value += 1
        else
          value += 11
      })

      return value
    }

    getValueString() {
      const cardsString = this.toString()
      const total = this.getValue()

      let totalString = `**Total:** ${total} `
      if(total > 21)
        totalString += "`BUST`"
      if(total === 21)
        totalString += "⭐"
      
      return `${cardsString}\n${totalString}`
    }

    setStood(booleanValue) {
      this.stood = booleanValue
    }
  }

  
  if(userData) {
    message.channel.send("You currently have an ongoing blackjack game. Please finish or forfeit that game before starting a new one.")
    return
  }
  else {
    userData = {
      deck: new Deck(),
      hand: new Hand(),
      dealer: new Hand(),
      win: false,
      // gameOver: false
    }
  }


  const suits = {
    "spades": "♤",
    "hearts": "♡",
    "clubs": "♧",
    "diamonds": "♢"
  }

  const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  for(const suit in suits) {
    for(const number of numbers) {
      userData.deck.add(new Card(suit, number))
    }
  }

  const checkWin = () => { // https://en.wikipedia.org/wiki/Blackjack#Rules
    const { hand, dealer } = userData

    const handVal = hand.getValue()
    const dealerVal = dealer.getValue()

    if(handVal > 21)
      return -1
    if(handVal === 21) {
      if(dealerVal === 21)
        return -1
      else
        return 1
    }
    
    if(dealerVal > 21)
      return 1
    if(dealerVal === 21)
      return -1
    
    if(hand.stood && dealer.stood) { // if both players decided to stand
      if(handVal > dealerVal)
        return 1
      else
        return -1
    }

    return 0
  }

  const gameDisplay = (forfeit) => {
    let winner = checkWin()
    if(forfeit)
      winner = -1

    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setTitle("Blackjack")
    embedder.addBlankField(emb)
      .addField("🏠 Dealer's Hand", `${userData.dealer.getValueString()}`, true)
      .addField("✋ Your Hand", `${userData.hand.getValueString()}`, true)
    
    if(!winner) {
      emb
        .setColor("#ffff00")
        .addField("Instructions", "React with 🔨 to HIT.\nReact with 🧍 to STAND.\nReact with 🛑 to forfeit.")
        .setFooter(`Please react within 30 seconds.`)
    }
    else {
      // gameData.gameOver = true

      if(winner > 0) {
        gameData.win = true
        emb
          .setColor("#00ff00")
          .setDescription("You win.")
      }
      if(winner < 0) {
        gameData.win = false
        emb
          .setColor("#ff0000")
          .setDescription("You lose.")
      }
    }
    
    return emb
  }

  const makeDealerChoice = () => {
    if(userData.dealer.getValue() < 17) {
      userData.dealer.add(userData.deck.draw())
      userData.dealer.setStood(false)
    }
    else {
      userData.dealer.setStood(true)
    }
  }


  userData.hand
    .add(userData.deck.draw())
    .add(userData.deck.draw())
  userData.dealer
    .add(userData.deck.draw())
    .add(userData.deck.draw())
  
  const msg = await message.channel.send(gameDisplay())

  const emojis = ["🔨", "🧍", "🛑"]
  emojis.forEach(async emoji => await msg.react(emoji))

  const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)
  const collector = msg.createReactionCollector(filter, { time: 30000 })
    .on("collect", async (reaction, reactor) => {
      reaction.users.remove(reactor).catch(() => {})
      collector.resetTimer()

      let forfeit
      switch(reaction.emoji.name) {
        case "🔨":
          userData.hand.add(userData.deck.draw())
          userData.hand.setStood(false)
          break
        case "🧍":
          userData.hand.setStood(true)
          break
        case "🛑":
          forfeit = true
          collector.stop()
          break
      }

      if(!forfeit)
        makeDealerChoice()

      await msg.edit(gameDisplay(forfeit))
      // if(gameData.gameOver)
      //   collector.stop()
    })
    .on("end", async collected => {
      msg.edit(`Game Over ${gameData.win ? "you win" : "you lose"}`)
      delete gameData[message.author.id]
    })
}