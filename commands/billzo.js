exports.run = async (client, message, args) => {
  const billzos = require("../data/billzo/billzos.json")
  const thes = require("../data/billzo/thes.json")
  const adverbs = require("../data/billzo/adverbs.json")
  const adjectives = require("../data/billzo/adjectives.json")
  const nouns = require("../data/billzo/nouns.json")

  const randArrElem = arr => arr[Math.floor(Math.random() * (arr.length - 1))]
  
  let billzo, the, adj, noun
  billzo = randArrElem(billzos)
  the = randArrElem(thes)
  adv = randArrElem(adverbs)
  adj = randArrElem(adjectives)
  noun = randArrElem(nouns)

  let variations = [
    `${billzo} ${the} ${adv} ${adj} ${noun}`,
    `${billzo} ${the} ${adj} ${noun}`,
    `${billzo} ${the} ${noun}`,
    `${adv} ${adj} ${billzo}`
    `${adj} ${billzo}`
  ]

  // tag the variations that are too long to be set as a nickname
  for(i in variations) if(variations[i].length > 32) variations[i] += " `[>32]`"
  message.channel.send(variations.join("\n"))
}