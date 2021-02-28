const index = require("../index.js")
const { client, karmaQueue } = index

exports.add = async (userId, amount, options) => {
  const { logger } = client.util
  
  if(!karmaQueue[userId])
    karmaQueue[userId] = amount
  else
    karmaQueue[userId] += amount
  
  let logMessage = `Queued ${amount} karma for U ${userId}`

  if(options) {
    if(options.reason)
      logMessage += ` for \`${options.reason}\``
    if(options.voterId)
      logMessage += ` by V ${options.voterId}`
    if(options.messageId)
      logMessage += ` on M ${options.messageId}`
  }
  
  logger.log(logMessage, "addKarma")
}