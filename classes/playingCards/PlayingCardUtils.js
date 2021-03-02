
exports.suits = {
  "spades": "♤",
  "hearts": "♡",
  "clubs": "♧",
  "diamonds": "♢"
}
exports.numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
exports.getSuitIcon = (suit) => {
  if(this.suits[suit.toLowerCase()])
    return this.suits[suit.toLowerCase()]
  else
    return "?"
}