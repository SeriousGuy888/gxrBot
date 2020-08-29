exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config

  const { billzos, thes, adverbs, adjectives, nouns } = config.billzo

  const randArrElem = arr => arr[Math.floor(Math.random() * (arr.length - 1))]
  
  let billzo, the, adv, adj, noun
  billzo = randArrElem(billzos).replace(/i/g, "і") // replace latin i with cyrillic dotted i
  the = randArrElem(thes)
  adv = randArrElem(adverbs)
  adj = randArrElem(adjectives)
  noun = randArrElem(nouns)

  let variations = [
    `${billzo} ${the} ${adv} ${adj} ${noun}`,
    `${billzo} ${the} ${adj} ${noun}`,
    `${billzo} ${the} ${noun}`,
    `${adv} ${adj} ${billzo}`,
    `${adj} ${billzo}`
  ]

  // tag the variations that are too long to be set as a nickname
  for(let i in variations) if(variations[i].length > 32) variations[i] += " `[>32]`"
  message.channel.send(variations.join("\n"))
}