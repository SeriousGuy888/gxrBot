const PlayingCards = require("./PlayingCards.js")

module.exports = class Card {
  constructor(suit, number, hidden) {
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
    return `\`${this.getNumber()}${PlayingCards.getSuitIcon(this.getSuit())}\``
  }
}