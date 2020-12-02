exports.run = async (client, userId, amount, options) => {
  const index = require("../index.js")
  const { karmaQueue } = index

  if(!karmaQueue[userId])
    karmaQueue[userId] = amount
  else
    karmaQueue[userId] += amount
  
  let logMessage = `Queued ${amount} karma for ${userId}`

  if(options.reason)
    logMessage += ` for reason ${options.reason}`
  if(options.voter)
    logMessage += ` by ${options.voterId}`
  if(options.messageId)
    logMessage += ` on ${options.messageId}`
  
  console.log(logMessage)
}