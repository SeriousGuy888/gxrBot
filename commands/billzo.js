exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const adjectives = require("../data/billzo/adjectives.json")
  const nouns = require("../data/billzo/nouns.json")

  const randArrElem = (arr) => arr[Math.floor(Math.random() * arr.length)]
  message.channel.send(`billzo the ${randArrElem(adjectives)} ${randArrElem(nouns)}`)
}