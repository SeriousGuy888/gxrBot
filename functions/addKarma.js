exports.run = async (client, userId, amount, options) => {
  const index = require("../index.js")
  const { karmaQueue } = index

  if(!karmaQueue[userId])
    karmaQueue[userId] = amount
  else
    karmaQueue[userId] += amount
  
  let logMessage = `Queued ${amount} karma for user ${userId}`

  if(options) {
    if(options.reason)
      logMessage += ` for reason \`${options.reason}\``
    if(options.voterId)
      logMessage += ` by voter ${options.voterId}`
    if(options.messageId)
      logMessage += ` on message ${options.messageId}`
  }
  
  console.log(logMessage)
}