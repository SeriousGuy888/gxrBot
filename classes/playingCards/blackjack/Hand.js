const PlayingCards = require("../PlayingCards.js")

module.exports = class Hand extends PlayingCards.BaseHand {
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
}