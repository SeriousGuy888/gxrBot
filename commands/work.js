exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  const db = index.db
  let docRef = db.collection("users").doc(queryUserId)

  docRef.get().then(doc => {
    if(doc.exists) {
      message.channel.send(doc.data().lastWork)
    }
    else return message.channel.send("Before running this command, you must first have your profile created by running the `c!stats` command.")
  })
}
