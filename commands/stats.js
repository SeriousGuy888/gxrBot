exports.run = async (client, message, args) => {
  const index = require("../index.js")
  
  let queryUserId

  if(!args[0]) queryUserId = message.author.id
  else if(args[0]) queryUserId = message.mentions.users.first().id || args[0]

  message.channel.send(queryUserId)
}
