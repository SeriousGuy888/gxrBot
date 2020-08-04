exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const fs = index.fs

  function noArgs() {
    let helpHome = fs.readFileSync("./data/help/help.txt", "utf8")
    message.channel.send(helpHome)
  }
  
  function readFile(name) {
    if(!fs.existsSync(`./data/help/${args[0]}.txt`)) return `Error: File \`${name}\` does not exist.`
    let fileContents = fs.readFileSync(`./data/help/${name}.txt`, "utf8")
    return fileContents
  }
  
  if(!args[0]) noArgs()
  else message.channel.send(readFile(args[0]).replace(/%prefix%/gi, index.config.prefix))
}
