exports.run = async (client, userId, amount) => {
  const index = require("../index.js")
  const { karmaQueue } = index

  if(!karmaQueue[userId])
    karmaQueue[userId] = amount
  else
    karmaQueue[userId] += amount
  
  console.log(`Queued ${amount} karma for ${userId}`)
}