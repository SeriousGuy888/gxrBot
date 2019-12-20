exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const fs = index.fs
  const Discord = index.Discord

  function noArgs() {
    let helpHome = fs.readFileSync("./data/help.txt", "utf8")
    message.channel.send(helpHome)
  }
  
  if(!args[0]) noArgs()
  else {
    switch(args[0]) {
      case "cmds":
        message.channel.send("test")
        break
      default:
        message.channel.send("Invalid arguments.")
        noArgs()
        break
    }
  }
}
