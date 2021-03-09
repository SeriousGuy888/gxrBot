module.exports = {
  preferenceCache: {
    default: {
      notifications: true,
    },
  },
  balanceCache: {},
  balanceQueue: {},
  inventoryQueue: {},
  badgeQueue: {},
  karmaQueue: {},
  karmaCache: [],
  statQueue: {},
  statCache: {},
  graphCache: {
    karmaChange: {
      complete: false,
      cache: [],
    },
  },
  pauseAutocarrotCache: {}, // used for storing when people want g9lbot to stop autocarroting them
  gameCache: { // for storing when people are playing g9lbot's games
    blackjack: {},
    hangman: {},
    minesweeper: {},
  },
}