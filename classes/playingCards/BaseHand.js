const CardCollection = require("./CardCollection.js")

module.exports = class BaseHand extends CardCollection {
  constructor(cards) {
    super()
  }

  setAllHidden(hidden) {
    for(const card of this.cards) {
      card.setHidden(hidden)
    }

    return this
  }
}