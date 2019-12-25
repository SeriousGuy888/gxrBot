exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  const db = index.db

  let queryUserId

  if(!args[0]) queryUserId = message.author.id
  else if(args[0]) {
    if(!message.mentions.users.first()) queryUserId = args[0]
    else queryUserId = message.mentions.users.first().id
  }

  // message.channel.send(queryUserId)
  let doc = db.collection("users").doc(queryUserId)
}
