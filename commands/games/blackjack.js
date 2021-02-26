exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  
  const getCardValue = (cardName) => {
    const cardValue = cardName.charAt(0)
    const parsedInt = parseInt(cardValue)
    if(parsedInt)
      return parsedInt
    
    if(cardValue === "A")
      return 1
    else
      return 10
  }

  const suits = ["♤", "♡", "♧", "♢"]
  const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  let cards = []

  for(const loopSuit of suits) {
    for(const loopNumber of numbers) {
      cards.push(loopNumber + loopSuit)
    }
  }

  message.channel.send(cards.join(","))
}