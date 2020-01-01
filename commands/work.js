exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  const db = index.db

  let docRef = db.collection("users").doc(queryUserId)

  // docRef.get().then(doc => {
  //   if(doc.exists) {
  //     message.channel.send("```json\n" + JSON.stringify(doc.data(), null, 4) + "```")
  //   }
  //   else {
  //     docRef.set({balance: 0}).then(() => {
  //       message.channel.send("```json\n" + JSON.stringify(doc.data(), null, 4) + "```")
  //     })
  //   }
  // })

  
}
