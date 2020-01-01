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

  let docRef = db.collection("users").doc(queryUserId)
  let defaultStats = {
    balance: 0,
    lastWork: new Date(0)
  }

  docRef.get().then(doc => {
    if(doc.exists) {
      message.channel.send("```json\n" + JSON.stringify(doc.data(), null, 4) + "```")
    }
    else {
      docRef.set(defaultStats).then(() => {
        message.channel.send("```json\n" + JSON.stringify(defaultStats, null, 4) + "```")
      })
    }
  })
}
