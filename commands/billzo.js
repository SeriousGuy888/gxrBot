exports.run = async (client, message, args) => {
  const adjectives = require("../data/billzo/adjectives.json")
  const nouns = require("../data/billzo/nouns.json")
  const thes = require("../data/billzo/thes.json")

  const randArrElem = arr => arr[Math.floor(Math.random() * arr.length)]
  
  let billzo, the, adj, noun
  billzo = "billzo"
  the = randArrElem(thes)
  adj = randArrElem(adjectives)
  noun = randArrElem(nouns)

  let variations = [
    `${billzo} ${the} ${adj} ${noun}`,
    `${billzo} ${the} ${noun}`,
    `${adj} ${billzo}`
  ]

  // tag the variations that are too long to be set as a nickname
  for(i in variations) if(variations[i].length > 32) variations[i] += " `[>32]`"
  message.channel.send(variations.join("\n"))
}