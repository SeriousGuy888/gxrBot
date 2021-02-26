exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  
  const getCardValue = (number) => {
    const parsedInt = parseInt(number[0])
    if(parsedInt)
      return parsedInt
    
    if(number[0] === "A")
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