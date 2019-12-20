exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const fs = index.fs
  const Discord = index.Discord

  if(!args[0]) {
    let helpHome = fs.readFileSync("/data/help.txt", "utf8")
    message.channel.send(helpHome)
  }
}
