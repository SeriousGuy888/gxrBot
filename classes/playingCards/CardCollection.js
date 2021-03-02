const PlayingCards = require("./PlayingCards.js")

module.exports = class CardCollection {
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


  getNumbers() {
    return PlayingCards.numbers
  }
  getSuits() {
    return PlayingCards.suits
  }
}