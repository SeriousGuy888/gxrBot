exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  const { banker, embedder, messenger, statTracker } = client.util
  
  let gameData = index.gameCache.blackjack

  const coin = config.economy.settings.lang.emojis.coin


  const { Deck } = require("../../classes/playingCards/PlayingCards.js")
  const { Hand } = require("../../classes/playingCards/blackjack/Blackjack.js")


  let msg
  
  if(gameData[message.author.id]) {
    message.channel.send("You currently have an ongoing blackjack game. Please finish or forfeit that game before starting a new one.")
    return
  }
  else {
    const betAmount = Math.abs(parseFloat(parseFloat(args[0]).toFixed(2)) || 0)

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

      banker.addToBalance(message.author.id, -betAmount)
    }

    gameData[message.author.id] = {
      deck: new Deck().create(),
      hand: new Hand(),
      dealer: new Hand(),
      bet: betAmount,
      win: null,
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

  let winner
  const gameDisplay = (forfeit) => {
    winner = checkWin()
    if(forfeit)
      winner = -1

    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setTitle("Blackjack")
      .setDescription(`Click [here](https://en.wikipedia.org/wiki/Blackjack#Rules) for the ruleset we're using.`)
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
        gameData[message.author.id].win = true
        statTracker.add(message.author.id, "blackjack_win", 1)

        emb
          .setColor("#00ff00")
          .setDescription("You win. Your bet was returned and doubled.")
        if(gameData[message.author.id].bet)
          banker.addToBalance(message.author.id, gameData[message.author.id].bet * 2) // return bet and double
      }
      if(winner < 0) {
        gameData[message.author.id].win = false
        statTracker.add(message.author.id, "blackjack_lose", 1)

        emb
          .setColor("#ff0000")
          .setDescription("You lose. Your bet was not returned.")
        if(forfeit)
          emb.setFooter("Game was forfeited.")
        // bet was taken at start of game
      }
    }
      
    embedder.addBlankField(emb)
      .addField("🏠 Dealer's Hand", `${gameData[message.author.id].dealer.getValueString()}`, true)
      .addField("✋ Your Hand", `${gameData[message.author.id].hand.getValueString()}`, true)
    
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

  // if(gameData[message.author.id].win !== null)
  //   return
  const collector = msg.createReactionCollector(filter, { time: 60000 })
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
          break
      }

      if(!forfeit)
        makeDealerChoice()

      await msg.edit(gameDisplay(forfeit))
      if(winner)
        collector.stop()
      // if(gameData.gameOver)
      //   collector.stop()
    })
    .on("end", async (collected, reason) => {
      if(reason === "time") {
        msg.edit("```This blackjack game expired!```")
      }
      delete gameData[message.author.id]
    })
}

exports.disabled = "temp disabled during discord.js v13 update"