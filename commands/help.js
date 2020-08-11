exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const fs = index.fs

  function noArgs() {
    let helpHome = readFile("help")
    message.channel.send(helpHome)
  }
  
  function readFile(name) {
    if(!fs.existsSync(`./data/help/${name}.txt`)) return `Error: File \`${name}\` does not exist.`
    let fileContents = fs.readFileSync(`./data/help/${name}.txt`, "utf8")
    let fixedContents = fileContents
      .replace(/%prefix%/gi, index.config.prefix)
      .replace(/%lowername%/gi, index.config.botNames.lowerCamelCase)
      .replace(/%uppername%/gi, index.config.botNames.upperCase)
    
    return fixedContents
  }
  
  if(!args[0]) noArgs()
  else message.channel.send(readFile(args[0]))
}
