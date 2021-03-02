const Card = require("./Card.js")
const CardCollection = require("./CardCollection.js")

module.exports = class Deck extends CardCollection {
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