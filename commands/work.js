exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  const db = index.db
  let docRef = db.collection("users").doc(message.author.id)

  docRef.get().then(doc => {
    if(doc.exists) {
      message.channel.send(`Last worked timestamp: ${(new Date(doc.data().lastWork._seconds)).toString()}`)
    }
    else return message.channel.send("Before running this command, you must first have your profile created by running the `c!stats` command.")
  })
}
