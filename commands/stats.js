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
  let docRef = db.collection("users").doc(queryUserId)

  docRef.get().then(doc => {
    if(doc.exists) {
      message.channel.send("```json\n" + JSON.stringify(doc.data(), null, 4) + "```")
    }
    else {
      docRef.set({
        balance: 0,
        lastWork: new Date(0)
      }).then(() => {
        message.channel.send("```json\n" + JSON.stringify(doc.data(), null, 4) + "```")
      })
    }
  })
}
