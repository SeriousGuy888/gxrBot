exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  const db = index.db
  let docRef = db.collection("users").doc(message.author.id)

  docRef.get().then(doc => {
    if(doc.exists) {
      message.channel.send(JSON.stringify(doc.data().lastWork, null, 4))
    }
    else return message.channel.send("Before running this command, you must first have your profile created by running the `c!stats` command.")
  })
}
