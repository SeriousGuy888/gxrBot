exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const timeFormatter = index.timeFormatter

  const db = index.db
  let docRef = db.collection("users").doc(message.author.id)

  docRef.get().then(doc => {
    if(doc.exists) {
      var lastWork = new Date(doc.data().lastWork._seconds)
      var now = new Date()
      var diff = Math.abs(now - lastWork) / 1000
      var diffStr = timeFormatter.timeConvert({
        seconds: diff,
        format: "letters"
      }
    )

      message.channel.send(`Last worked timestamp: ${lastWork.toISOString()}\nCurrent timestamp: ${now.toISOString()}\n---\nLast worked timestamp difference: ${diffStr}`)
    }
    else return message.channel.send("Before running this command, you must first have your profile created by running the `c!stats` command.")
  })
}
