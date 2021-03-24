const index = require("../index.js")
const { Discord } = index

const { Game } = require("../classes/games/Games.js")
const { gamePlayerData } = require("../cache.js")

exports.createGame = (userId, game, data) => {
  if(gamePlayerData[userId]) {
    return null
  }
  gamePlayerData[userId] = new Game(game, data)
}

exports.isPlaying = (userId, game) => {
  if(gamePlayerData[userId]) {
    if(game) {
      return gamePlayerData[userId].game === game
    }
    return true
  }
  return false
}
exports.getPlayerData = (userId) => {
  if(!this.isPlaying(userId)) {
    return null
  }
  return gamePlayerData[userId]
}

exports.clearGame = (userId) => {
  delete gamePlayerData[userId]
}