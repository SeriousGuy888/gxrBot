exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  const { banker, embedder, messenger } = client.util
  
  let gameData = index.gameCache.blackjack

  const coin = config.economy.settings.lang.emojis.coin
  
  
  class PlayingCards {
    suits = {
      "spades": "♤",
      "hearts": "♡",
      "clubs": "♧",
      "diamonds": "♢"
    }
  
    numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

    getSuitIcon(suit) {
      if(this.suits[suit.toLowerCase()])
        return this.suits[suit.toLowerCase()]
      else
        return "?"
    }
  }
  class Card extends PlayingCards {
    constructor(suit, number, hidden) {
      super()

      this.suit = suit
      this.number = number
      this.hidden = hidden
    }

    getSuit(force) {
      if(force || !this.hidden) // if the card is face-up or force is true, reveal
        return this.suit
      else // if the card is face-down, return ?
        return "?"
    }

    getNumber(force) {
      if(force || !this.hidden)
        return this.number
      else
        return "?"
    }

    getHidden() {
      return this.hidden
    }

    setHidden(hidden) {
      this.hidden = hidden
      return this
    }

    toString() {
      return `\`${this.getNumber()}${this.getSuitIcon(this.getSuit())}\``
    }
  }
  class CardCollection extends PlayingCards {
    constructor(cards) {
      super()

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


    getNumbers() {
      return this.numbers
    }
    getSuits() {
      return this.suits
    }
  }
  class Deck extends CardCollection {
    draw(hidden) {
      const cardIndex = Math.floor(Math.random() * this.cards.length)
      const card = this.cards[cardIndex]
  
      this.cards.splice(cardIndex, 1)

      if(hidden === undefined)
        return card
      else
        return card.setHidden(hidden)
    }

    create() {
      for(const suit in this.getSuits()) {
        for(const number of this.getNumbers()) {
          this.add(new Card(suit, number))
        }
      }

      return this
    }
  }
  class Hand extends CardCollection {
    constructor(cards) {
      super()
      this.stood = false
    }

    getValue(force) {
      let cards = this.cards

      const aces = []
      for(const i in cards) {
        if(cards[i].getNumber(force) === "A") {
          aces.push(cards[i])
          cards.splice(i, 1)
        }
      }

      let includesHiddenCards = false
      let value = 0

      for(const i in cards) {
        if(cards[i].getHidden())
          includesHiddenCards = true
        if(cards[i].getNumber(force).match(/[JQK]/)) {
          value += 10
        }
        else {
          value += parseInt(cards[i].getNumber(force))
        }
      }

      aces.forEach(() => {
        if(value + 11 > 21)
          value += 1
        else
          value += 11
      })

      if(force || !includesHiddenCards)
        return value
      else
        return -1
    }

    getValueString() {
      const cardsString = this.toString()
      const total = this.getValue()

      let totalString = `**Total:** ${total === -1 ? "?" : total} `
      if(total > 21)
        totalString += "`BUST`"
      if(total === 21)
        totalString += "⭐"
      
      return `${cardsString}\n${totalString}`
    }

    setStood(booleanValue) {
      this.stood = booleanValue
    }

    setAllHidden(hidden) {
      for(const card of this.cards) {
        card.setHidden(hidden)
      }

      return this
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
      deck: new Deck().create(),
      hand: new Hand(),
      dealer: new Hand(),
      bet: betAmount,
      win: false,
      // gameOver: false
    }
  }

  const checkWin = () => { // https://en.wikipedia.org/wiki/Blackjack#Rules
    const { hand, dealer } = gameData[message.author.id]

    const handVal = hand.getValue(true)
    const dealerVal = dealer.getValue(true)

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
      .setTitle("Blackjack `Click for Rules`")
      .setURL("https://en.wikipedia.org/wiki/Blackjack#Rules")
      .setDescription(gameData[message.author.id].deck.cards.length + gameData[message.author.id].deck.toString())
      .addField(`Bet (\`${config.main.prefix}blackjack [bet]\`)`, `${coin}${gameData[message.author.id].bet}`)
    
    if(!winner) {
      emb
        .setColor("#ffff00")
        .addField("Instructions", "React with 🔨 to HIT.\nReact with 🧍 to STAND.\nReact with 🛑 to forfeit.")
        .setFooter(`Please react within 30 seconds.`)
    }
    else {
      // gameData.gameOver = true
      gameData[message.author.id].dealer.setAllHidden(false)
      gameData[message.author.id].hand.setAllHidden(false)

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
      
    embedder.addBlankField(emb)
      .addField("🏠 Dealer's Hand", `${gameData[message.author.id].dealer.getValueString()}`, true)
      .addField("✋ Your Hand", `${gameData[message.author.id].hand.getValueString()}`, true)
    
    if(winner)
      collector.stop()
    
    return emb
  }

  const makeDealerChoice = () => {
    if(gameData[message.author.id].dealer.getValue(true) < 17) {
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
    .add(gameData[message.author.id].deck.draw(true))
  
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