exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  const timeFormatter = index.timeFormatter

  const db = index.db
  let docRef = db.collection("users").doc(message.author.id)

  var cooldown = 1 * 60 * 60 // 1 hour multiplied by sixty minutes by sixty seconds
  // todo: make this a config option and not a hard coded variable

  docRef.get().then(doc => {
    if(doc.exists) {
      var lastWork = new Date(doc.data().lastWork._seconds)
      var now = new Date()
      var diff = Math.abs(now - lastWork) / 1000
      var diffStr = timeFormatter.timeConvert({
        seconds: diff,
        format: "letters"
      })

      message.channel.send(`Last worked timestamp: ${lastWork.toISOString()}\nCurrent timestamp: ${now.toISOString()}\n---\nLast worked timestamp difference: ${diffStr}`)
      if(diff < cooldown) {
        return message.channel.send(`Cooldown has ${diffStr} remaining.`)
      }
      else if(diff >= cooldown) {
        return message.channel.send(":D")
      }
    }
    else return message.channel.send("Before running this command, you must first have your profile created by running the `c!stats` command.")
  })
}
