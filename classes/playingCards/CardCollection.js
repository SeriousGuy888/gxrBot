const PlayingCardUtils = require("./PlayingCardUtils.js")

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
    return PlayingCardUtils.numbers
  }
  getSuits() {
    return PlayingCardUtils.suits
  }
}