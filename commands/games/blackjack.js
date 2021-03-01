exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  const { banker, embedder, messenger } = client.util
  
  let gameData = index.gameCache.blackjack

  const coin = config.economy.settings.lang.emojis.coin
  
  
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

    toString() {
      return `\`${this.getNumber()}${suits[this.getSuit()]}\``
    }
  }
  class CardCollection {
    constructor(cards) {
      this.cards = cards ?? []
    }

    toString() {
      let output = []
      for(const card of this.cards) {
        output.push(card.toString())
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


  let msg
  
  if(gameData[message.author.id]) {
    message.channel.send("You currently have an ongoing blackjack game. Please finish or forfeit that game before starting a new one.")
    return
  }
  else {
    const betAmount = Math.abs(parseInt(args[0]) || 0)

    msg = await messenger.loadingMessage(message.channel, {
      colour: config.main.colours.help,
      title: "Placing Bet...",
      description: `Amount: ${coin}${betAmount}`
    })

    if(betAmount) {
      const balance = await banker.getBalance(message.author.id)
      if(balance < betAmount) {
        msg.edit(messenger.errorMessage(msg, {
          title: "Insufficient Funds",
          description: `Your bet was ${coin}${betAmount} but you only have ${coin}${balance}.`
        }))
        return
      }
    }

    gameData[message.author.id] = {
      deck: new Deck(),
      hand: new Hand(),
      dealer: new Hand(),
      bet: betAmount,
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
      gameData[message.author.id].deck.add(new Card(suit, number))
    }
  }

  const checkWin = () => { // https://en.wikipedia.org/wiki/Blackjack#Rules
    const { hand, dealer } = gameData[message.author.id]

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
      .setDescription(gameData[message.author.id].deck.cards.length + gameData[message.author.id].deck.toString())
      .addField("Bet", `${coin}${gameData[message.author.id].bet}`)
    embedder.addBlankField(emb)
      .addField("🏠 Dealer's Hand", `${gameData[message.author.id].dealer.getValueString()}`, true)
      .addField("✋ Your Hand", `${gameData[message.author.id].hand.getValueString()}`, true)
    
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
        message.channel.send("win bet")
      }
      if(winner < 0) {
        gameData.win = false
        emb
          .setColor("#ff0000")
          .setDescription("You lose.")
        message.channel.send("lose bet")
      }
    }
    
    return emb
  }

  const makeDealerChoice = () => {
    if(gameData[message.author.id].dealer.getValue() < 17) {
      gameData[message.author.id].dealer.add(gameData[message.author.id].deck.draw())
      gameData[message.author.id].dealer.setStood(false)
    }
    else {
      gameData[message.author.id].dealer.setStood(true)
    }
  }


  gameData[message.author.id].hand
    .add(gameData[message.author.id].deck.draw())
    .add(gameData[message.author.id].deck.draw())
  gameData[message.author.id].dealer
    .add(gameData[message.author.id].deck.draw())
    .add(gameData[message.author.id].deck.draw())
  
  await msg.edit(gameDisplay())

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
          gameData[message.author.id].hand.add(gameData[message.author.id].deck.draw())
          gameData[message.author.id].hand.setStood(false)
          break
        case "🧍":
          gameData[message.author.id].hand.setStood(true)
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