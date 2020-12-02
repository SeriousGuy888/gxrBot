exports.run = async (client, userId, amount, options) => {
  const index = require("../index.js")
  const { karmaQueue } = index
  const { reason, voterId, messageId } = options

  if(!karmaQueue[userId])
    karmaQueue[userId] = amount
  else
    karmaQueue[userId] += amount
  
  let logMessage = `Queued ${amount} karma for ${userId}`

  if(reason)
    logMessage += ` for reason ${reason}`
  if(voter)
    logMessage += ` by ${voterId}`
  if(messageId)
    logMessage += ` on ${messageId}`
  
  console.log(logMessage)
}