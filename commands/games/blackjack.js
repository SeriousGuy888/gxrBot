exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index // import from index.js
  
  function cardValue(number){
    if(!number[0].isNan()) return parseInt(number[0])
    else if(number[0] == "A") return 1
    else return 10
  }

  const suits = ["♠️", "♥️", "♣️", "♦️"]
  const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  const cards = []

  for(const loopSuit of suits){
    for(const loopNumber of numbers){
      cards.push(loopNumber + loopSuit)
    }
  }

  console.log(cards)

}